-- ============================================================
-- SEED — Reverso de carta: Pollo a la Brasa, Broaster,
--        Burger, Acompañamiento y Postres
-- ============================================================

-- CATEGORÍAS
insert into categories (id, name) values
  ('22222222-0000-0000-0000-000000000001', 'Pollo a la Brasa'),
  ('22222222-0000-0000-0000-000000000002', 'Broaster'),
  ('22222222-0000-0000-0000-000000000003', 'Burger'),
  ('22222222-0000-0000-0000-000000000004', 'Acompañamiento'),
  ('22222222-0000-0000-0000-000000000005', 'Postres');

-- ============================================================
-- POLLO A LA BRASA
-- ============================================================
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('1/8 de Pollo a la Brasa', 'Papas fritas, ensalada y cremas',                                      '', '1/8 de Pollo a la Brasa', '22222222-0000-0000-0000-000000000001'),
    ('1/4 de Pollo a la Brasa', 'Papas fritas, ensalada y cremas',                                      '', '1/4 de Pollo a la Brasa', '22222222-0000-0000-0000-000000000001'),
    ('1/2 Pollo a la Brasa',    'Papas fritas, ensalada, cremas + 1 litro de chicha',                   '', '1/2 Pollo a la Brasa',    '22222222-0000-0000-0000-000000000001'),
    ('1 Pollo a la Brasa',      'Papas fritas, ensalada, cremas + 1 litro de chicha',                   '', '1 Pollo a la Brasa',      '22222222-0000-0000-0000-000000000001'),
    ('Monstrito',               '1/8 de pollo a la brasa, papas fritas, arroz chaufa, ensalada y cremas','', 'Monstrito',               '22222222-0000-0000-0000-000000000001'),
    ('Monstro',                 '1/4 de pollo a la brasa, papas fritas, arroz chaufa, ensalada y cremas','', 'Monstro',                 '22222222-0000-0000-0000-000000000001'),
    ('Chaufa de Pollo',         'Trozos de pollo, arroz y cremas',                                      '', 'Chaufa de Pollo',         '22222222-0000-0000-0000-000000000001'),
    ('Chaufa a lo Pobre',       'Trozos de pollo, platanitos, huevo, cebolla china y arroz',            '', 'Chaufa a lo Pobre',       '22222222-0000-0000-0000-000000000001'),
    ('Pollito a lo Pobre',      'Papas fritas + arroz + plátano + huevo + ensalada',                    '', 'Pollito a lo Pobre',      '22222222-0000-0000-0000-000000000001'),
    ('Pollito Parrillero',      'Papas fritas + anticucho + chorizo + ensalada',                        '', 'Pollito Parrillero',      '22222222-0000-0000-0000-000000000001')
  returning id, name
)
insert into product_variants (product_id, label, price, sort_order)
select p.id, v.label, v.price, v.sort_order
from p
join (values
  ('1/8 de Pollo a la Brasa', null,       11.00, 0),
  ('1/4 de Pollo a la Brasa', null,       18.00, 0),
  ('1/2 Pollo a la Brasa',    null,       43.00, 0),
  ('1 Pollo a la Brasa',      null,       80.00, 0),
  ('Monstrito',               null,       15.00, 0),
  ('Monstro',                 null,       20.00, 0),
  ('Chaufa de Pollo',         null,       15.00, 0),
  ('Chaufa a lo Pobre',       null,       21.00, 0),
  ('Pollito a lo Pobre',      '1/8 pollo',19.00, 0),
  ('Pollito a lo Pobre',      '1/4 pollo',25.00, 1),
  ('Pollito Parrillero',      '1/8 pollo',25.00, 0),
  ('Pollito Parrillero',      '1/4 pollo',30.00, 1)
) as v(product_name, label, price, sort_order) on p.name = v.product_name;

-- ============================================================
-- BROASTER
-- ============================================================
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('1 Pieza Broaster',   'Papas fritas + cremas',                                                 '', '1 Pieza Broaster',   '22222222-0000-0000-0000-000000000002'),
    ('2 Piezas Broaster',  'Papas fritas + cremas',                                                 '', '2 Piezas Broaster',  '22222222-0000-0000-0000-000000000002'),
    ('Brostrito',          '1 pieza de broaster + arroz chaufa + papas fritas + cremas',            '', 'Brostrito',          '22222222-0000-0000-0000-000000000002'),
    ('Salchibroaster',     '1 pieza de broaster + salchichas + papas fritas + cremas',              '', 'Salchibroaster',     '22222222-0000-0000-0000-000000000002'),
    ('Mix Personal',       '1/8 de pollo a la brasa + 1 pieza broaster + ensalada + papas + cremas','', 'Mix Personal',       '22222222-0000-0000-0000-000000000002'),
    ('Chicken Fingers',    '4 chicken fingers + papas fritas + cremas',                             '', 'Chicken Fingers',    '22222222-0000-0000-0000-000000000002')
  returning id, name
)
insert into product_variants (product_id, price, sort_order)
select id, case name
  when '1 Pieza Broaster'  then 11.00
  when '2 Piezas Broaster' then 19.00
  when 'Brostrito'         then 14.90
  when 'Salchibroaster'    then 16.00
  when 'Mix Personal'      then 20.00
  when 'Chicken Fingers'   then 11.00
end, 0
from p;

-- ============================================================
-- BURGER
-- ============================================================
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('Hamburguesa Clásica',        '1 disco de carne, lechuga, tomate y papas al hilo',                           '', 'Hamburguesa Clásica',        '22222222-0000-0000-0000-000000000003'),
    ('Cheeseburger al Plato',      '1 disco de carne, queso, tomate, lechuga y papas fritas',                     '', 'Cheeseburger al Plato',      '22222222-0000-0000-0000-000000000003'),
    ('Royal al Plato',             '1 disco de carne, queso, huevo frito, tomate, lechuga y papas fritas',        '', 'Royal al Plato',             '22222222-0000-0000-0000-000000000003'),
    ('Hamburguesa Doble al Plato', '2 discos de carne, queso, huevo frito, tomate, lechuga y papas fritas',       '', 'Hamburguesa Doble al Plato', '22222222-0000-0000-0000-000000000003'),
    ('Hamburguesa al Plato',       '1 disco de carne, chorizo, arroz, ensalada y papas andinas',                  '', 'Hamburguesa al Plato',       '22222222-0000-0000-0000-000000000003')
  returning id, name
)
insert into product_variants (product_id, price, sort_order)
select id, case name
  when 'Hamburguesa Clásica'        then 10.00
  when 'Cheeseburger al Plato'      then 12.00
  when 'Royal al Plato'             then 14.00
  when 'Hamburguesa Doble al Plato' then 17.00
  when 'Hamburguesa al Plato'       then 19.00
end, 0
from p;

-- ============================================================
-- ACOMPAÑAMIENTO (con variantes de tamaño)
-- ============================================================
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('Ensalada Fresca',    'Ensalada fresca de la casa',           '', 'Ensalada Fresca',    '22222222-0000-0000-0000-000000000004'),
    ('Papas Fritas',       'Papas fritas crocantes',               '', 'Papas Fritas',       '22222222-0000-0000-0000-000000000004'),
    ('Arroz Monstrito',    'Arroz chaufa de la casa',              '', 'Arroz Monstrito',    '22222222-0000-0000-0000-000000000004'),
    ('Salchicha',          'Salchicha parrillera',                 '', 'Salchicha',          '22222222-0000-0000-0000-000000000004'),
    ('Plátano',            'Plátano frito',                        '', 'Plátano',            '22222222-0000-0000-0000-000000000004'),
    ('Arroz con Choclo',   'Arroz con choclo',                     '', 'Arroz con Choclo',   '22222222-0000-0000-0000-000000000004'),
    ('Anticucho de Carne', 'Anticucho de carne a la parrilla',     '', 'Anticucho de Carne','22222222-0000-0000-0000-000000000004'),
    ('Chorizo Parrillero', 'Chorizo a la parrilla',                '', 'Chorizo Parrillero','22222222-0000-0000-0000-000000000004')
  returning id, name
)
insert into product_variants (product_id, label, price, sort_order)
select p.id, v.label, v.price, v.sort_order
from p
join (values
  ('Ensalada Fresca',  'Personal',  3.00, 0),
  ('Ensalada Fresca',  'Mediana',   7.00, 1),
  ('Papas Fritas',     'Personal',  7.00, 0),
  ('Papas Fritas',     'Familiar', 12.00, 1),
  ('Arroz Monstrito',  'Personal',  3.50, 0),
  ('Arroz Monstrito',  'Mediano',   7.00, 1),
  ('Salchicha',         null,        7.00, 0),
  ('Plátano',           null,        3.00, 0),
  ('Arroz con Choclo',  null,        3.50, 0),
  ('Anticucho de Carne',null,        8.00, 0),
  ('Chorizo Parrillero',null,        7.00, 0)
) as v(product_name, label, price, sort_order) on p.name = v.product_name;

-- ============================================================
-- POSTRES
-- ============================================================
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('Gelatina',           'Gelatina de sabores',         '', 'Gelatina',           '22222222-0000-0000-0000-000000000005'),
    ('Helado 2 Bolas',     'Helado de 2 bolas',           '', 'Helado 2 Bolas',     '22222222-0000-0000-0000-000000000005'),
    ('Torta de Chocolate', 'Torta de chocolate casera',   '', 'Torta de Chocolate', '22222222-0000-0000-0000-000000000005'),
    ('Causa Limeña',       'Causa limeña tradicional',    '', 'Causa Limeña',       '22222222-0000-0000-0000-000000000005')
  returning id, name
)
insert into product_variants (product_id, price, sort_order)
select id, case name
  when 'Gelatina'           then 3.00
  when 'Helado 2 Bolas'     then 8.50
  when 'Torta de Chocolate' then 7.00
  when 'Causa Limeña'       then 8.00
end, 0
from p;
