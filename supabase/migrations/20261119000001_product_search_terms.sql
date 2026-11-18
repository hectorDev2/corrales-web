-- Otros nombres con los que el cliente puede buscar un plato
-- (ej. "pollo asado, chicken" para "Pollo a la brasa"). Solo para búsqueda.
alter table public.products
  add column if not exists search_terms text not null default '';
