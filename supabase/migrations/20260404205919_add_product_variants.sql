-- ============================================================
-- PRODUCT VARIANTS
-- Separa el precio del producto base para soportar variantes
-- (ej: Mollejitas 100gr / 200gr, Gaseosa 1/2L / 1L / 2L)
-- ============================================================

-- Eliminar columna price de products (se mueve a variants)
alter table products drop column price;

-- Tabla de variantes
create table product_variants (
  id         uuid           primary key default gen_random_uuid(),
  product_id uuid           not null references products(id) on delete cascade,
  label      text,                                          -- null = producto sin variantes
  price      numeric(10, 2) not null check (price >= 0),
  is_active  boolean        not null default true,
  sort_order int            not null default 0
);

-- order_items ahora apunta a la variante específica
alter table order_items
  add column variant_id    uuid references product_variants(id) on delete set null,
  add column variant_label text;  -- snapshot del label al momento del pedido

-- ============================================================
-- RESTAURANT INFO
-- Datos del local: teléfono, web, etc. (singleton)
-- ============================================================
create table restaurant_info (
  id           integer     primary key default 1 check (id = 1),
  name         text        not null,
  phone_fixed  text,
  phone_mobile text,
  website      text,
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================
alter table product_variants enable row level security;
alter table restaurant_info  enable row level security;

create policy "public: read active variants"
  on product_variants for select
  using (is_active = true);

create policy "admin: manage variants"
  on product_variants for all to authenticated
  using (current_user_role() = 'admin');

create policy "public: read restaurant info"
  on restaurant_info for select
  using (true);

create policy "admin: manage restaurant info"
  on restaurant_info for all to authenticated
  using (current_user_role() = 'admin');
