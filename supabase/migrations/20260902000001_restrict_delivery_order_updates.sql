-- ============================================================
-- Least-privilege updates for authenticated order clients
-- RLS decides which rows can change; column grants decide which fields
-- can be written by the browser.
-- ============================================================

revoke update on table public.orders from authenticated;
grant update (status, assigned_to) on table public.orders to authenticated;

drop policy if exists "delivery: update assigned orders" on public.orders;
create policy "delivery: update assigned orders"
  on public.orders for update to authenticated
  using (
    public.current_user_role() = 'delivery'
    and assigned_to = auth.uid()
  )
  with check (
    public.current_user_role() = 'delivery'
    and assigned_to = auth.uid()
    and status in ('en_camino', 'entregado')
  );

-- A delivery user can only take an unassigned ready order and keep ownership.
drop policy if exists "delivery: take available order" on public.orders;
create policy "delivery: take available order"
  on public.orders for update to authenticated
  using (
    public.current_user_role() = 'delivery'
    and status = 'listo'
    and delivery_type = 'delivery'
    and assigned_to is null
  )
  with check (
    public.current_user_role() = 'delivery'
    and assigned_to = auth.uid()
    and status = 'en_camino'
  );
