-- Delivery puede ver órdenes disponibles (listo + delivery + sin asignar)
create policy "delivery: read available orders"
  on orders for select to authenticated
  using (
    current_user_role() = 'delivery'
    and status = 'listo'
    and delivery_type = 'delivery'
    and assigned_to is null
  );

-- Delivery puede auto-asignarse una orden disponible
create policy "delivery: take available order"
  on orders for update to authenticated
  using (
    current_user_role() = 'delivery'
    and status = 'listo'
    and delivery_type = 'delivery'
    and assigned_to is null
  )
  with check (
    assigned_to = auth.uid()
    and status = 'en_camino'
  );
