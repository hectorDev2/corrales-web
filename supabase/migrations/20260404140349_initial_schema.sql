-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('admin', 'delivery');
create type order_status as enum ('pendiente', 'preparando', 'listo', 'en_camino', 'entregado', 'cancelado');
create type delivery_type as enum ('delivery', 'pickup');
create type payment_method as enum ('yape', 'cash');
create type reservation_status as enum ('pendiente', 'confirmada', 'cancelada');

-- ============================================================
-- PROFILES
-- Extiende auth.users con rol y datos extra
-- ============================================================
create table profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  role       user_role   not null default 'delivery',
  full_name  text        not null,
  phone      text,
  is_active  boolean     not null default true,
  created_at timestamptz not null default now()
);

-- Auto-crear perfil al registrar un usuario en auth
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'delivery')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table products (
  id          uuid           primary key default gen_random_uuid(),
  name        text           not null,
  description text           not null,
  price       numeric(10, 2) not null check (price >= 0),
  image_src   text           not null,
  image_alt   text           not null,
  tag         text,
  category_id uuid           not null references categories(id),
  is_active   boolean        not null default true,
  created_at  timestamptz    not null default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table orders (
  id               uuid           primary key default gen_random_uuid(),
  order_number     integer        not null generated always as identity,
  status           order_status   not null default 'pendiente',
  delivery_type    delivery_type  not null,
  customer_name    text           not null,
  customer_phone   text           not null,
  customer_address text,
  customer_notes   text,
  payment_method   payment_method not null,
  total            numeric(10, 2) not null check (total >= 0),
  assigned_to      uuid           references profiles(id) on delete set null,
  created_at       timestamptz    not null default now(),
  updated_at       timestamptz    not null default now()
);

create unique index orders_order_number_idx on orders(order_number);

-- Auto-actualizar updated_at en cada UPDATE
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ============================================================
-- ORDER ITEMS
-- Snapshot de nombre y precio al momento del pedido
-- ============================================================
create table order_items (
  id           uuid           primary key default gen_random_uuid(),
  order_id     uuid           not null references orders(id) on delete cascade,
  product_id   uuid           references products(id) on delete set null,
  product_name text           not null,
  unit_price   numeric(10, 2) not null check (unit_price >= 0),
  quantity     int            not null check (quantity > 0)
);

-- ============================================================
-- RESERVATIONS
-- ============================================================
create table reservations (
  id             uuid               primary key default gen_random_uuid(),
  customer_name  text               not null,
  customer_phone text               not null,
  date           date               not null,
  time           text               not null,
  guests         int                not null check (guests between 1 and 20),
  notes          text,
  status         reservation_status not null default 'pendiente',
  created_at     timestamptz        not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles     enable row level security;
alter table categories   enable row level security;
alter table products     enable row level security;
alter table orders       enable row level security;
alter table order_items  enable row level security;
alter table reservations enable row level security;

-- Helper: obtener el rol del usuario autenticado
create or replace function current_user_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- PROFILES
create policy "admin: full access"
  on profiles for all to authenticated
  using (current_user_role() = 'admin');

create policy "delivery: read own profile"
  on profiles for select to authenticated
  using (id = auth.uid());

-- CATEGORIES (lectura pública, escritura solo admin)
create policy "public: read categories"
  on categories for select
  using (true);

create policy "admin: manage categories"
  on categories for all to authenticated
  using (current_user_role() = 'admin');

-- PRODUCTS (lectura pública de activos, escritura solo admin)
create policy "public: read active products"
  on products for select
  using (is_active = true);

create policy "admin: manage products"
  on products for all to authenticated
  using (current_user_role() = 'admin');

-- ORDERS
create policy "admin: full access orders"
  on orders for all to authenticated
  using (current_user_role() = 'admin');

create policy "delivery: read assigned orders"
  on orders for select to authenticated
  using (
    current_user_role() = 'delivery'
    and assigned_to = auth.uid()
  );

create policy "delivery: update assigned orders"
  on orders for update to authenticated
  using (
    current_user_role() = 'delivery'
    and assigned_to = auth.uid()
  )
  with check (
    status in ('en_camino', 'entregado')
  );

create policy "public: insert orders"
  on orders for insert
  with check (true);

-- ORDER ITEMS
create policy "admin: full access order_items"
  on order_items for all to authenticated
  using (current_user_role() = 'admin');

create policy "delivery: read own order items"
  on order_items for select to authenticated
  using (
    current_user_role() = 'delivery'
    and exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.assigned_to = auth.uid()
    )
  );

create policy "public: insert order_items"
  on order_items for insert
  with check (true);

-- RESERVATIONS
create policy "admin: full access reservations"
  on reservations for all to authenticated
  using (current_user_role() = 'admin');

create policy "public: insert reservations"
  on reservations for insert
  with check (true);

-- ============================================================
-- SEED — Categorías del menú
-- ============================================================
insert into categories (name) values
  ('Pollo a la Brasa'),
  ('Parrillas'),
  ('Fast Food'),
  ('Bebidas'),
  ('Postres');
