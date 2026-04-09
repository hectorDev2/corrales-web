-- ============================================================
-- STORAGE — Bucket para imágenes de productos
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Lectura pública (menú visible para todos)
create policy "public: read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Solo admin puede subir imágenes
create policy "admin: insert product images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (select public.current_user_role()) = 'admin'
  );

-- Solo admin puede actualizar
create policy "admin: update product images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.current_user_role()) = 'admin'
  );

-- Solo admin puede eliminar
create policy "admin: delete product images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.current_user_role()) = 'admin'
  );
