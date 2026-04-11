-- ============================================================
-- Slider Slides — contenido del carrusel del home
-- ============================================================

create table slider_slides (
  id           uuid    primary key default gen_random_uuid(),
  type         text    not null default 'custom'
                       check (type in ('image', 'custom')),
  sort_order   int     not null default 0,
  is_active    boolean not null default true,

  -- Image type
  image_url    text,

  -- Custom type
  eyebrow      text,
  title        text,
  subtitle     text,
  cta_label    text,
  cta_href     text,
  bg_gradient  text    default 'from-[#1a0a00] via-[#3d1500] to-[#f25600]',
  accent_color text    default '#f25600',
  icon         text    default 'outdoor_grill',

  created_at   timestamptz default now()
);

-- Storage bucket para flyers del slider
insert into storage.buckets (id, name, public)
values ('slider-images', 'slider-images', true)
on conflict (id) do nothing;

-- Política: solo admins pueden subir/borrar
create policy "Admin manage slider images"
  on storage.objects for all
  using  (bucket_id = 'slider-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'slider-images' and auth.role() = 'authenticated');

-- Política: lectura pública
create policy "Public read slider images"
  on storage.objects for select
  using (bucket_id = 'slider-images');

-- Seed con los slides actuales
insert into slider_slides (type, sort_order, eyebrow, title, subtitle, cta_label, cta_href, bg_gradient, accent_color, icon) values
  ('custom', 1, 'Clásico de siempre', E'Pollo a la\nBrasa',       E'Dorado, jugoso y con nuestra\nsalsa secreta de la casa.',          'Ver Carta',    '/menu', 'from-[#1a0a00] via-[#3d1500] to-[#f25600]', '#f25600', 'outdoor_grill'),
  ('custom', 2, 'Delivery express',   E'Llega en\n30 minutos',    E'Pide desde acá y recibe\ntodo caliente en tu puerta.',             'Pedir ahora',  '/menu', 'from-[#0a1a00] via-[#1a3a00] to-[#2d5a00]', '#6ab04c', 'delivery_dining'),
  ('custom', 3, 'Nuevo en carta',     E'Broaster\nEspecial',      E'Crujiente por fuera, tierno\npor dentro. Papas incluidas.',        'Ver combo',    '/menu', 'from-[#1a1000] via-[#3d2800] to-[#a06000]', '#f0a500', 'restaurant');
