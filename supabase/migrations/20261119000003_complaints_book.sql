-- Libro de Reclamaciones propio (formato básico exigido por Indecopi).
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity,
  created_at timestamptz not null default now(),
  full_name text not null,
  document_type text not null check (document_type in ('DNI', 'CE', 'Pasaporte', 'RUC')),
  document_number text not null,
  phone text not null,
  email text not null,
  address text not null,
  item_type text not null check (item_type in ('producto', 'servicio')),
  item_description text not null,
  amount numeric(10, 2),
  kind text not null check (kind in ('reclamo', 'queja')),
  detail text not null,
  consumer_request text not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'atendido')),
  privacy_policy_accepted boolean not null check (privacy_policy_accepted)
);

alter table public.complaints enable row level security;

-- Solo administradores pueden consultar o gestionar los reclamos; el envío lo hace la API con service_role.
create policy "admin: manage complaints"
  on public.complaints for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
