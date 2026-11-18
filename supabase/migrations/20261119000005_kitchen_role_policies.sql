-- PASO 2 de 2: permisos del perfil "cocina".
-- Puede ver los pedidos y sus productos, y solo avanzarlos de estado
-- (pendiente → preparando → listo). No ve precios de facturación ni nada del resto del admin.

drop policy if exists "cocina: read orders" on public.orders;
create policy "cocina: read orders"
  on public.orders for select to authenticated
  using (public.current_user_role() = 'cocina');

drop policy if exists "cocina: advance orders" on public.orders;
create policy "cocina: advance orders"
  on public.orders for update to authenticated
  using (
    public.current_user_role() = 'cocina'
    and status in ('pendiente', 'preparando')
  )
  with check (
    public.current_user_role() = 'cocina'
    and status in ('preparando', 'listo')
  );

drop policy if exists "cocina: read order items" on public.order_items;
create policy "cocina: read order items"
  on public.order_items for select to authenticated
  using (public.current_user_role() = 'cocina');

drop policy if exists "cocina: read tables" on public.restaurant_tables;
create policy "cocina: read tables"
  on public.restaurant_tables for select to authenticated
  using (public.current_user_role() = 'cocina');
