-- ============================================================
-- Server-authoritative order pricing
-- The browser may submit item identifiers and quantities, but never
-- determines the persisted total or snapshot prices.
-- ============================================================

create or replace function public.resolve_order_item_price(
  p_product_id uuid,
  p_variant_id uuid,
  p_selected_options jsonb default '[]'::jsonb
)
returns table (
  product_name text,
  variant_label text,
  unit_price numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_name text;
  v_variant_label text;
  v_unit_price numeric;
  v_option jsonb;
  v_option_price numeric;
  v_option_group_id uuid;
  v_group record;
  v_selected_count integer;
begin
  if p_selected_options is null then
    p_selected_options := '[]'::jsonb;
  end if;

  if jsonb_typeof(p_selected_options) <> 'array' then
    raise exception 'Las opciones del pedido son inválidas.' using errcode = '22023';
  end if;

  select p.name, pv.label, pv.price
    into v_product_name, v_variant_label, v_unit_price
  from public.product_variants pv
  join public.products p on p.id = pv.product_id
  where pv.id = p_variant_id
    and pv.product_id = p_product_id
    and pv.is_active = true
    and p.is_active = true;

  if not found then
    raise exception 'Producto o variante no disponible.' using errcode = '22023';
  end if;

  for v_option in select value from jsonb_array_elements(p_selected_options)
  loop
    if not (v_option ? 'option_id')
      or not (v_option ? 'quantity')
      or coalesce((v_option->>'quantity')::integer, 0) <= 0
      or (v_option->>'quantity') !~ '^[1-9][0-9]*$' then
      raise exception 'La selección de opciones es inválida.' using errcode = '22023';
    end if;

    select po.price_delta, po.group_id
      into v_option_price, v_option_group_id
    from public.product_options po
    join public.product_option_groups pog on pog.id = po.group_id
    where po.id = (v_option->>'option_id')::uuid
      and pog.product_id = p_product_id;

    if not found then
      raise exception 'La opción seleccionada no pertenece al producto.' using errcode = '22023';
    end if;

    v_unit_price := v_unit_price + (v_option_price * (v_option->>'quantity')::integer);
  end loop;

  -- Enforce the same required/min/max constraints used by the catalog UI.
  for v_group in
    select id, min_select, max_select, is_required
    from public.product_option_groups
    where product_id = p_product_id
  loop
    select coalesce(sum((selected->>'quantity')::integer), 0)
      into v_selected_count
    from jsonb_array_elements(p_selected_options) selected
    join public.product_options po
      on po.id = (selected->>'option_id')::uuid
    where po.group_id = v_group.id;

    if v_group.is_required and v_selected_count < v_group.min_select then
      raise exception 'Faltan opciones obligatorias del producto.' using errcode = '22023';
    end if;

    if v_group.max_select is not null and v_selected_count > v_group.max_select then
      raise exception 'Se excedió el máximo de opciones del producto.' using errcode = '22023';
    end if;
  end loop;

  return query select v_product_name, v_variant_label, round(v_unit_price, 2);
end;
$$;

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
  if p_delivery_type not in ('delivery', 'pickup') then
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

  -- Preserve the current storefront behavior: the configured S/ 5 charge
  -- is included in every checkout total. It is not accepted from the client.
  return round(v_subtotal + 5.00, 2);
end;
$$;

-- Keep internal pricing helpers unavailable to anon/authenticated callers.
revoke all on function public.resolve_order_item_price(uuid, uuid, jsonb) from public;
revoke all on function public.calculate_order_total(text, jsonb) from public;
grant execute on function public.calculate_order_total(text, jsonb) to service_role;

-- Force every public checkout through create_order so direct REST inserts
-- cannot bypass the server-side catalog and total validation.
drop policy if exists "public: insert orders" on public.orders;
drop policy if exists "public: insert order_items" on public.order_items;

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

  return v_order_number;
end;
$$;

grant execute on function public.create_order(
  text, text, text, text, text, text, text, numeric, jsonb
) to anon, authenticated, service_role;
