-- Nubefact / SUNAT Electronic Invoicing
-- RUC Emisor: 20604262322

-- ── Invoice Series ──────────────────────────────────────────
create table invoice_series (
  id             uuid    primary key default gen_random_uuid(),
  type           text    not null check (type in ('boleta', 'factura')),
  series         text    not null,
  current_number integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ── Invoices ────────────────────────────────────────────────
create table invoices (
  id                    uuid        primary key default gen_random_uuid(),
  order_id              uuid        not null references orders(id) on delete cascade,
  invoice_type          text        not null check (invoice_type in ('boleta', 'factura')),
  series                text        not null,
  number                integer     not null,
  customer_doc_type     text        not null,
  customer_doc_number   text        not null,
  customer_business_name text,
  customer_address      text,
  total                 numeric(10,2) not null,
  sunat_status          text        not null default 'pending' check (sunat_status in ('pending', 'accepted', 'rejected')),
  sunat_code            text,
  sunat_message         text,
  sunat_response        jsonb,
  pdf_url               text,
  xml_url               text,
  created_at            timestamptz not null default now(),
  unique(series, number)
);

-- ── Fiscal data columns on orders ──────────────────────────
alter table orders add column if not exists customer_doc_type    text;
alter table orders add column if not exists customer_doc_number  text;
alter table orders add column if not exists customer_business_name text;

-- ── RLS ─────────────────────────────────────────────────────
alter table invoice_series enable row level security;
alter table invoices enable row level security;

create policy "Admins can manage invoice_series"
  on invoice_series for all
  using (current_user_role() = 'admin');

create policy "Admins can manage invoices"
  on invoices for all
  using (current_user_role() = 'admin');

-- ── Seed default series ─────────────────────────────────────
insert into invoice_series (type, series, current_number) values
  ('boleta',  'B001', 0),
  ('factura', 'F001', 0);
