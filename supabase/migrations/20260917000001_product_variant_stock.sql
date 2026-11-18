-- ============================================================
-- STOCK POR VARIANTE
-- El stock pertenece a la variante porque cada presentación puede
-- tener disponibilidad independiente.
-- ============================================================

alter table public.product_variants
  add column stock integer not null default 30
  constraint product_variants_stock_non_negative check (stock >= 0);

-- Las variantes existentes y las nuevas empiezan con 30 unidades por defecto;
-- el administrador puede ajustar la existencia real desde Administración > Productos.

-- Reservar stock al crear cada línea del pedido. El UPDATE condicional es
-- atómico y evita sobreventa cuando dos pedidos llegan al mismo tiempo.
create or replace function public.reserve_product_variant_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.variant_id is null then
    return new;
  end if;

  update public.product_variants
  set stock = stock - new.quantity
  where id = new.variant_id
    and product_id = new.product_id
    and is_active = true
    and stock >= new.quantity;

  if not found then
    raise exception 'Stock insuficiente para el producto solicitado.' using errcode = '22023';
  end if;

  return new;
end;
$$;

revoke all on function public.reserve_product_variant_stock() from public;

create trigger order_items_reserve_product_variant_stock
  before insert on public.order_items
  for each row execute function public.reserve_product_variant_stock();

-- Los pedidos de Culqi se crean antes de cobrar para calcular el importe.
-- Si el pago falla y el pedido se cancela, se libera la reserva.
create or replace function public.release_cancelled_order_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelado' and old.status <> 'cancelado' then
    update public.product_variants pv
    set stock = pv.stock + reserved.quantity
    from (
      select variant_id, sum(quantity) as quantity
      from public.order_items
      where order_id = new.id
        and variant_id is not null
      group by variant_id
    ) reserved
    where pv.id = reserved.variant_id;
  end if;

  return new;
end;
$$;

revoke all on function public.release_cancelled_order_stock() from public;

create trigger orders_release_cancelled_stock
  after update of status on public.orders
  for each row execute function public.release_cancelled_order_stock();
