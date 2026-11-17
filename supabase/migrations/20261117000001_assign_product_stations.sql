-- Asigna la estación de producción (impresora) a los productos existentes.
-- Por defecto todo es 'cocina' (ver 20261117000000_product_station.sql).

-- Bebidas → barra
update public.products p
set station = 'barra'
from public.categories c
where p.category_id = c.id
  and c.name in ('Bebidas', 'Cóctails', 'Tragos');

-- Pollo entero, medio, cuarto y octavo → horno
update public.products
set station = 'horno'
where name in (
  '1 Pollo a la Brasa',
  '1/2 Pollo a la Brasa',
  '1/4 de Pollo a la Brasa',
  '1/8 de Pollo a la Brasa'
);

-- El resto queda en 'cocina'.
