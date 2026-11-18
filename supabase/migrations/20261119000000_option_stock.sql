-- ============================================================
-- STOCK POR OPCIÓN DE PERSONALIZACIÓN
-- stock NULL = ilimitado (no se controla). Con valor, se descuenta al
-- crear el pedido y se devuelve si el pedido se cancela.
-- ============================================================

alter table public.product_options
  add column if not exists stock integer
  constraint product_options_stock_non_negative check (stock is null or stock >= 0);

-- Registro de lo reservado por pedido, para poder devolverlo al cancelar.
create table if not exists public.order_option_reservations (
  order_id  uuid not null references public.orders(id) on delete cascade,
  option_id uuid not null references public.product_options(id) on delete cascade,
  quantity  integer not null check (quantity > 0),
  primary key (order_id, option_id)
);
alter table public.order_option_reservations enable row level security;

create or replace function public.reserve_order_option_stock(p_order_id uuid, p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_stock integer;
  v_name text;
begin
  for r in
    select (o->>'option_id')::uuid as option_id,
           sum((o->>'quantity')::integer * (i->>'quantity')::integer)::integer as qty
    from jsonb_array_elements(p_items) i,
         jsonb_array_elements(coalesce(i->'selected_options', '[]'::jsonb)) o
    group by 1
    order by 1
  loop
    select stock, name into v_stock, v_name
    from public.product_options
    where id = r.option_id
    for update;

    if v_stock is null then
      continue;
    end if;

    if v_stock < r.qty then
      raise exception 'Opción agotada: %', v_name using errcode = '22023';
    end if;

    update public.product_options set stock = stock - r.qty where id = r.option_id;
    insert into public.order_option_reservations (order_id, option_id, quantity)
    values (p_order_id, r.option_id, r.qty);
  end loop;
end;
$$;

revoke all on function public.reserve_order_option_stock(uuid, jsonb) from public;

create or replace function public.release_cancelled_order_option_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelado' and old.status <> 'cancelado' then
    update public.product_options po
    set stock = po.stock + r.quantity
    from public.order_option_reservations r
    where r.order_id = new.id
      and po.id = r.option_id
      and po.stock is not null;

    delete from public.order_option_reservations where order_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.release_cancelled_order_option_stock() from public;

drop trigger if exists orders_release_cancelled_option_stock on public.orders;
create trigger orders_release_cancelled_option_stock
  after update of status on public.orders
  for each row execute function public.release_cancelled_order_option_stock();

-- Los pedidos (web y mesa) ahora reservan el stock de las opciones elegidas.
create or replace function public.create_order(
  p_delivery_type        text,
  p_customer_name        text,
  p_customer_phone       text,
  p_customer_address     text,
  p_customer_notes       text,
  p_customer_location_url text,
  p_payment_method       text,
  p_total                numeric,
  p_items                jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id       uuid;
  v_order_number   integer;
  v_item           jsonb;
  v_calculated_total numeric;
  v_product_name   text;
  v_variant_label  text;
  v_unit_price     numeric;
begin
  -- p_total remains in the signature for client compatibility, but is
  -- intentionally ignored. The database is the pricing authority.
  v_calculated_total := public.calculate_order_total(p_delivery_type, p_items);

  insert into public.orders (
    status,
    delivery_type,
    customer_name,
    customer_phone,
    customer_address,
    customer_notes,
    customer_location_url,
    payment_method,
    total
  ) values (
    'pendiente',
    p_delivery_type::public.delivery_type,
    p_customer_name,
    p_customer_phone,
    p_customer_address,
    p_customer_notes,
    p_customer_location_url,
    p_payment_method::public.payment_method,
    v_calculated_total
  )
  returning id, order_number into v_order_id, v_order_number;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    select resolved.product_name, resolved.variant_label, resolved.unit_price
      into v_product_name, v_variant_label, v_unit_price
    from public.resolve_order_item_price(
      (v_item->>'product_id')::uuid,
      (v_item->>'variant_id')::uuid,
      coalesce(v_item->'selected_options', '[]'::jsonb)
    ) resolved;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      variant_id,
      variant_label,
      unit_price,
      quantity
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_product_name,
      (v_item->>'variant_id')::uuid,
      v_variant_label,
      v_unit_price,
      (v_item->>'quantity')::integer
    );
  end loop;

  perform public.reserve_order_option_stock(v_order_id, p_items);

  return v_order_number;
end;
$$;

create or replace function public.create_table_order(
  p_table_token    text,
  p_customer_name  text,
  p_customer_notes text,
  p_items          jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_table          public.restaurant_tables%rowtype;
  v_order_id       uuid;
  v_order_number   integer;
  v_item           jsonb;
  v_total          numeric;
  v_product_name   text;
  v_variant_label  text;
  v_unit_price     numeric;
  v_name           text;
begin
  select * into v_table
  from public.restaurant_tables
  where qr_token = p_table_token and is_active = true;

  if not found then
    raise exception 'Mesa no disponible.' using errcode = '22023';
  end if;

  v_total := public.calculate_order_total('dine_in', p_items);
  v_name  := coalesce(nullif(trim(p_customer_name), ''), 'Mesa ' || v_table.label);

  insert into public.orders (
    status, delivery_type, customer_name, customer_phone,
    customer_notes, payment_method, total, table_id
  ) values (
    'pendiente', 'dine_in', left(v_name, 80), '-',
    left(p_customer_notes, 200), 'cash', v_total, v_table.id
  )
  returning id, order_number into v_order_id, v_order_number;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    select resolved.product_name, resolved.variant_label, resolved.unit_price
      into v_product_name, v_variant_label, v_unit_price
    from public.resolve_order_item_price(
      (v_item->>'product_id')::uuid,
      (v_item->>'variant_id')::uuid,
      coalesce(v_item->'selected_options', '[]'::jsonb)
    ) resolved;

    insert into public.order_items (
      order_id, product_id, product_name, variant_id, variant_label, unit_price, quantity
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_product_name,
      (v_item->>'variant_id')::uuid,
      v_variant_label,
      v_unit_price,
      (v_item->>'quantity')::integer
    );
  end loop;

  perform public.reserve_order_option_stock(v_order_id, p_items);

  return v_order_number;
end;
$$;

grant execute on function public.create_order(
  text, text, text, text, text, text, text, numeric, jsonb
) to anon, authenticated, service_role;

grant execute on function public.create_table_order(text, text, text, jsonb)
  to anon, authenticated, service_role;
