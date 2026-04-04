-- ============================================================
-- SEED — Pollería Corrales
-- ============================================================

-- Limpiar seed anterior
truncate table product_variants cascade;
truncate table products cascade;
delete from categories;
delete from restaurant_info;

-- ============================================================
-- RESTAURANT INFO
-- ============================================================
insert into restaurant_info (id, name, phone_fixed, phone_mobile, website)
values (1, 'Pollería Corrales', '084 604736', '901 20 40 20', 'www.polleriacorrales.com');

-- ============================================================
-- CATEGORÍAS
-- ============================================================
insert into categories (id, name) values
  ('11111111-0000-0000-0000-000000000001', 'Salchipapas'),
  ('11111111-0000-0000-0000-000000000002', 'Extras'),
  ('11111111-0000-0000-0000-000000000003', 'Parrillas'),
  ('11111111-0000-0000-0000-000000000004', 'Bebidas'),
  ('11111111-0000-0000-0000-000000000005', 'Cóctails'),
  ('11111111-0000-0000-0000-000000000006', 'Tragos');

-- ============================================================
-- PRODUCTOS + VARIANTES
-- ============================================================

-- Helper: inserta un producto y devuelve su id
-- Usamos CTEs encadenadas por bloque de categoría

-- SALCHIPAPAS
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('Salchipapa Clásica',       'Salchicha con papas fritas y cremas',                                                                          '', 'Salchipapa Clásica',       '11111111-0000-0000-0000-000000000001'),
    ('Salchipapa Especial',      'Tocino, huevo frito, salchicha con papas fritas y cremas',                                                     '', 'Salchipapa Especial',      '11111111-0000-0000-0000-000000000001'),
    ('Salchipapa Super Especial','Salchicha con papas fritas, huevo frito, más chorizo y cremas',                                                '', 'Salchipapa Super Especial','11111111-0000-0000-0000-000000000001'),
    ('Salchicina',               'Salchicha, tocino con papas fritas, huevo frito, más chorizo y cremas',                                        '', 'Salchicina',               '11111111-0000-0000-0000-000000000001'),
    ('Salchipapa Corrales',      'Salchicha con papas fritas, huevo frito, hamburguesa, chorizo y pollo deshilachado más cremas',                 '', 'Salchipapa Corrales',      '11111111-0000-0000-0000-000000000001'),
    ('Salchi Pollo',             'Salchipapa + 1 octavo de pollo a la brasa con papas fritas y cremas',                                          '', 'Salchi Pollo',             '11111111-0000-0000-0000-000000000001')
  returning id, name
)
insert into product_variants (product_id, price, sort_order)
select id, case name
  when 'Salchipapa Clásica'        then 12.00
  when 'Salchipapa Especial'       then 14.50
  when 'Salchipapa Super Especial' then 17.00
  when 'Salchicina'                then 19.50
  when 'Salchipapa Corrales'       then 27.00
  when 'Salchi Pollo'              then 15.00
end, 0
from p;

-- EXTRAS (con variantes de precio para Mollejitas y Alitas)
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('Mollejitas Corrales', 'Mollejitas, papas andinas, choclo, queso andino, ensalada y cremas',                              '', 'Mollejitas Corrales', '11111111-0000-0000-0000-000000000002'),
    ('Chuleta de Cerdo',    'Arroz blanco, papas andinas, ensalada y cremas',                                                  '', 'Chuleta de Cerdo',    '11111111-0000-0000-0000-000000000002'),
    ('Pechuga a la Parrilla','Pechuga marinada con chimichurri, arroz blanco, papas andinas, ensalada y cremas',               '', 'Pechuga a la Parrilla','11111111-0000-0000-0000-000000000002'),
    ('Alitas BBQ / de Casa', 'Acompañadas de papas andinas',                                                                   '', 'Alitas BBQ / de Casa','11111111-0000-0000-0000-000000000002')
  returning id, name
)
insert into product_variants (product_id, label, price, sort_order)
select
  p.id,
  v.label,
  v.price,
  v.sort_order
from p
join (values
  ('Mollejitas Corrales', '100gr',       15.00, 0),
  ('Mollejitas Corrales', '200gr',       29.00, 1),
  ('Chuleta de Cerdo',     null,          18.00, 0),
  ('Pechuga a la Parrilla',null,          20.00, 0),
  ('Alitas BBQ / de Casa', '5 unidades',  19.00, 0),
  ('Alitas BBQ / de Casa', '10 unidades', 35.00, 1)
) as v(product_name, label, price, sort_order) on p.name = v.product_name;

-- PARRILLAS
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('Parrilla a Compartir', '1/4 pollo a la brasa, chuleta de cerdo, 2 palitos de anticucho, 2 chorizos, 100gr mollejitas, papas fritas, ensalada y cremas', '', 'Parrilla a Compartir', '11111111-0000-0000-0000-000000000003'),
    ('Parrilla Familiar',    '1/2 pollo a la brasa, chuleta de cerdo, 2 palitos de anticucho, 3 chorizos, 200gr mollejitas, papas fritas, ensalada y cremas',  '', 'Parrilla Familiar',    '11111111-0000-0000-0000-000000000003')
  returning id, name
)
insert into product_variants (product_id, price, sort_order)
select id, case name
  when 'Parrilla a Compartir' then 65.00
  when 'Parrilla Familiar'    then 105.00
end, 0
from p;

-- BEBIDAS (gaseosas con variantes de tamaño + refrescantes + té piteado)
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('Gaseosa',         'Gaseosa fría',                                                     '', 'Gaseosa',         '11111111-0000-0000-0000-000000000004'),
    ('Agua San Luis',   'Agua mineral',                                                     '', 'Agua San Luis',   '11111111-0000-0000-0000-000000000004'),
    ('Limonada',        'Refrescante de limonada con hielo',                                '', 'Limonada',        '11111111-0000-0000-0000-000000000004'),
    ('Maracuyá',        'Refrescante de maracuyá con hielo',                                '', 'Maracuyá',        '11111111-0000-0000-0000-000000000004'),
    ('Chicha',          'Chicha morada con hielo',                                          '', 'Chicha',          '11111111-0000-0000-0000-000000000004'),
    ('Frutos Rojos',    'Refrescante de frutos rojos',                                      '', 'Frutos Rojos',    '11111111-0000-0000-0000-000000000004'),
    ('Infusiones',      'Té, Anís o Manzanilla',                                            '', 'Infusiones',      '11111111-0000-0000-0000-000000000004'),
    ('Té Piteado',      'Tetera de litro con el sabor de tu preferencia: Clásico, Maracuyá, Frutos Rojos o Menta', '', 'Té Piteado', '11111111-0000-0000-0000-000000000004')
  returning id, name
)
insert into product_variants (product_id, label, price, sort_order)
select
  p.id,
  v.label,
  v.price,
  v.sort_order
from p
join (values
  ('Gaseosa',      '1/2 Litro',  6.00,  0),
  ('Gaseosa',      '1 Litro',   10.00,  1),
  ('Gaseosa',      '2 Litros',  15.00,  2),
  ('Agua San Luis', null,         3.00,  0),
  ('Limonada',     'Jarra',     13.00,  0),
  ('Limonada',     'Personal',   7.00,  1),
  ('Maracuyá',     'Jarra',     13.00,  0),
  ('Maracuyá',     'Personal',   7.00,  1),
  ('Chicha',       'Jarra',     13.00,  0),
  ('Chicha',       'Personal',   7.00,  1),
  ('Frutos Rojos',  null,         9.00,  0),
  ('Infusiones',    null,         3.00,  0),
  ('Té Piteado',   'Clásico',   15.00,  0),
  ('Té Piteado',   'Especial',  18.00,  1)
) as v(product_name, label, price, sort_order) on p.name = v.product_name;

-- CÓCTAILS
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('Mojito',        'Cócktail en vaso',  '', 'Mojito',        '11111111-0000-0000-0000-000000000005'),
    ('Chilcano',      'Cócktail en vaso',  '', 'Chilcano',      '11111111-0000-0000-0000-000000000005'),
    ('Pisco Sour',    'Por copa',          '', 'Pisco Sour',    '11111111-0000-0000-0000-000000000005'),
    ('Piña Colada',   'Cócktail en vaso',  '', 'Piña Colada',   '11111111-0000-0000-0000-000000000005'),
    ('Cuba Libre',    'Cócktail en vaso',  '', 'Cuba Libre',    '11111111-0000-0000-0000-000000000005')
  returning id, name
)
insert into product_variants (product_id, price, sort_order)
select id, case name
  when 'Mojito'      then 15.00
  when 'Chilcano'    then 15.00
  when 'Pisco Sour'  then  7.00
  when 'Piña Colada' then 18.00
  when 'Cuba Libre'  then 12.00
end, 0
from p;

-- TRAGOS
with p as (
  insert into products (name, description, image_src, image_alt, category_id) values
    ('Cerveza Cusqueña', '350ml',                          '', 'Cerveza Cusqueña', '11111111-0000-0000-0000-000000000006'),
    ('Sangría',          'Por jarra',                      '', 'Sangría',          '11111111-0000-0000-0000-000000000006'),
    ('Vinos',            'Pregunte por nuestros vinos',    '', 'Vinos',            '11111111-0000-0000-0000-000000000006'),
    ('Descorche',        'Por botella',                    '', 'Descorche',        '11111111-0000-0000-0000-000000000006')
  returning id, name
)
insert into product_variants (product_id, price, sort_order)
select id, case name
  when 'Cerveza Cusqueña' then  8.00
  when 'Sangría'          then 30.00
  when 'Vinos'            then  0.00
  when 'Descorche'        then 15.00
end, 0
from p;
