-- Estación de producción de cada producto: define en qué impresora sale su comanda.
alter table public.products
  add column if not exists station text not null default 'cocina'
  check (station in ('cocina', 'horno', 'barra'));
