-- ============================================================
-- FUNCIÓN: create_order
-- Inserta order + order_items en una sola transacción y
-- devuelve el order_number sin necesitar SELECT separado.
-- SECURITY DEFINER para saltear RLS en el insert atómico.
-- ============================================================
create or replace function create_order(
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
as $$
declare
  v_order_id     uuid;
  v_order_number integer;
  v_item         jsonb;
begin
  insert into orders (
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
    p_delivery_type::delivery_type,
    p_customer_name,
    p_customer_phone,
    p_customer_address,
    p_customer_notes,
    p_customer_location_url,
    p_payment_method::payment_method,
    p_total
  )
  returning id, order_number into v_order_id, v_order_number;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into order_items (
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
      v_item->>'product_name',
      (v_item->>'variant_id')::uuid,
      v_item->>'variant_label',
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::integer
    );
  end loop;

  return v_order_number;
end;
$$;

-- Permitir ejecución a usuarios anónimos (clientes sin cuenta)
grant execute on function create_order to anon;
