-- ============================================================
-- Content visibility and storage authorization
-- ============================================================

alter table public.site_settings enable row level security;
alter table public.slider_slides enable row level security;

grant select on public.site_settings, public.slider_slides to anon, authenticated;
grant insert, update, delete on public.site_settings, public.slider_slides to authenticated;

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Admin manage site settings" on public.site_settings;
create policy "Admin manage site settings"
  on public.site_settings for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "Public read active slider slides" on public.slider_slides;
create policy "Public read active slider slides"
  on public.slider_slides for select
  using (is_active = true);

drop policy if exists "Admin manage slider slides" on public.slider_slides;
create policy "Admin manage slider slides"
  on public.slider_slides for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "Admin manage slider images" on storage.objects;
create policy "Admin manage slider images"
  on storage.objects for all
  using (
    bucket_id = 'slider-images'
    and public.current_user_role() = 'admin'
  )
  with check (
    bucket_id = 'slider-images'
    and public.current_user_role() = 'admin'
  );
