-- ============================================================
-- Pedidos desde la mesa con QR
-- - restaurant_tables: mesas con posición en el mapa y token de QR
-- - orders.table_id + delivery_type 'dine_in'
-- - get_table_by_token / create_table_order: acceso público acotado
-- ============================================================

alter type public.delivery_type add value if not exists 'dine_in';

create table public.restaurant_tables (
  id         uuid        primary key default gen_random_uuid(),
  label      text        not null unique check (char_length(label) between 1 and 20),
  zone       text        not null default 'Salón' check (char_length(zone) between 1 and 40),
  capacity   integer     not null default 4 check (capacity between 1 and 30),
  pos_x      numeric(5, 2) not null default 10 check (pos_x between 0 and 100),
  pos_y      numeric(5, 2) not null default 10 check (pos_y between 0 and 100),
  qr_token   text        not null unique default replace(gen_random_uuid()::text, '-', ''),
  is_active  boolean     not null default true,
  created_at timestamptz not null default now()
);

alter table public.restaurant_tables enable row level security;

create policy "admin: manage restaurant_tables"
  on public.restaurant_tables for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

alter table public.orders
  add column table_id uuid references public.restaurant_tables(id) on delete set null;

create index orders_table_id_idx on public.orders(table_id) where table_id is not null;

alter table public.restaurant_tables replica identity full;
alter publication supabase_realtime add table public.restaurant_tables;

-- El total de un pedido en mesa no lleva el cargo de delivery.
create or replace function public.calculate_order_total(
  p_delivery_type text,
  p_items jsonb
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_item_price numeric;
  v_subtotal numeric := 0;
  v_item_count integer;
begin
  if p_delivery_type not in ('delivery', 'pickup', 'dine_in') then
    raise exception 'Tipo de entrega inválido.' using errcode = '22023';
  end if;

  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'Los productos del pedido son inválidos.' using errcode = '22023';
  end if;

  v_item_count := jsonb_array_length(p_items);
  if v_item_count < 1 or v_item_count > 50 then
    raise exception 'El pedido debe tener entre 1 y 50 líneas.' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if not (v_item ? 'product_id')
      or not (v_item ? 'variant_id')
      or not (v_item ? 'quantity')
      or (v_item->>'quantity') !~ '^[1-9][0-9]*$'
      or (v_item->>'quantity')::integer > 99 then
      raise exception 'La línea del pedido es inválida.' using errcode = '22023';
    end if;

    select resolved.unit_price
      into v_item_price
    from public.resolve_order_item_price(
      (v_item->>'product_id')::uuid,
      (v_item->>'variant_id')::uuid,
      coalesce(v_item->'selected_options', '[]'::jsonb)
    ) resolved;

    v_subtotal := v_subtotal + (v_item_price * (v_item->>'quantity')::integer);
  end loop;

  if p_delivery_type = 'dine_in' then
    return round(v_subtotal, 2);
  end if;

  return round(v_subtotal + 5.00, 2);
end;
$$;

-- Resolución pública del QR: solo devuelve id/label/zone de mesas activas.
create or replace function public.get_table_by_token(p_token text)
returns table (id uuid, label text, zone text)
language sql
security definer
set search_path = public
stable
as $$
  select t.id, t.label, t.zone
  from public.restaurant_tables t
  where t.qr_token = p_token
    and t.is_active = true;
$$;

grant execute on function public.get_table_by_token(text) to anon, authenticated, service_role;

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

  return v_order_number;
end;
$$;

grant execute on function public.create_table_order(text, text, text, jsonb)
  to anon, authenticated, service_role;
