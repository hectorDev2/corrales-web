-- Orientación de la mesa en el mapa: 0 = a lo ancho, 90 = girada.
alter table public.restaurant_tables
  add column if not exists rotation smallint not null default 0
  constraint restaurant_tables_rotation_check check (rotation in (0, 90));
