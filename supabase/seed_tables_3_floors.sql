-- Crea los 3 pisos con sus mesas (30 en total).
--   Piso 1: 10 mesas en L (1-10)
--   Piso 2: 12 mesas en U (11-22)
--   Piso 3:  8 mesas en 2 filas (23-30)
-- Seguro de re-ejecutar: si una mesa con ese número ya existe, no la duplica ni la modifica.
-- Cada mesa recibe su QR automáticamente (qr_token).

insert into public.restaurant_tables (label, zone, capacity, pos_x, pos_y) values
  ('1', 'Piso 1', 4, 12, 20),
  ('2', 'Piso 1', 4, 12, 35.11),
  ('3', 'Piso 1', 2, 12, 50.22),
  ('4', 'Piso 1', 4, 12, 65.33),
  ('5', 'Piso 1', 6, 12.44, 80),
  ('6', 'Piso 1', 4, 27.56, 80),
  ('7', 'Piso 1', 2, 42.67, 80),
  ('8', 'Piso 1', 4, 57.78, 80),
  ('9', 'Piso 1', 4, 72.89, 80),
  ('10', 'Piso 1', 6, 88, 80),
  ('11', 'Piso 2', 4, 12, 20),
  ('12', 'Piso 2', 4, 12, 37.82),
  ('13', 'Piso 2', 4, 12, 55.64),
  ('14', 'Piso 2', 2, 12, 73.45),
  ('15', 'Piso 2', 4, 23.27, 80),
  ('16', 'Piso 2', 6, 41.09, 80),
  ('17', 'Piso 2', 4, 58.91, 80),
  ('18', 'Piso 2', 4, 76.73, 80),
  ('19', 'Piso 2', 2, 88, 73.45),
  ('20', 'Piso 2', 4, 88, 55.64),
  ('21', 'Piso 2', 4, 88, 37.82),
  ('22', 'Piso 2', 6, 88, 20),
  ('23', 'Piso 3', 4, 12, 34),
  ('24', 'Piso 3', 4, 37.33, 34),
  ('25', 'Piso 3', 6, 62.67, 34),
  ('26', 'Piso 3', 4, 88, 34),
  ('27', 'Piso 3', 2, 12, 72),
  ('28', 'Piso 3', 4, 37.33, 72),
  ('29', 'Piso 3', 6, 62.67, 72),
  ('30', 'Piso 3', 8, 88, 72)
on conflict (label) do nothing;

-- Verificación
select zone, count(*) as mesas, sum(capacity) as sillas
from public.restaurant_tables
where zone in ('Piso 1', 'Piso 2', 'Piso 3')
group by zone order by zone;
