-- ============================================================
-- SEED: Option Groups + Options para productos del menú
-- ============================================================
-- Antes de correr esto, obtené los UUID de tus productos desde
-- Supabase Dashboard → SQL Editor → SELECT id, name FROM products;
-- y reemplazá los placeholders '<UUID_DEL_PRODUCTO>' abajo.
-- ============================================================

-- ─── EJEMPLO 1: Producto tipo combo con personalización ─────
-- Insertá el group y options para un producto que quieras personalizar
/*
INSERT INTO product_option_groups (id, product_id, name, selection_type, min_select, max_select, is_required, sort_order)
VALUES
  (gen_random_uuid(), '<REEMPLAZAR_CON_UUID>', 'Elige tu Complemento', 'single',  1, 1, true,  1),
  (gen_random_uuid(), '<REEMPLAZAR_CON_UUID>', 'Elige tu Bebida',     'single',  1, 1, true,  2),
  (gen_random_uuid(), '<REEMPLAZAR_CON_UUID>', 'Agrega un Extra',     'quantity', 0, 5, false, 3);

-- Options para "Elige tu Complemento" (group_id = reemplazar con el UUID devuelto arriba)
INSERT INTO product_options (id, group_id, name, image_url, price_delta, sort_order) VALUES
  (gen_random_uuid(), '<GROUP_UUID>', 'Papas Fritas',       NULL, 0,    1),
  (gen_random_uuid(), '<GROUP_UUID>', 'Ensalada Fresca',    NULL, 0,    2),
  (gen_random_uuid(), '<GROUP_UUID>', 'Puré de Papas',      NULL, 0,    3);

-- Options para "Elige tu Bebida"
INSERT INTO product_options (id, group_id, name, image_url, price_delta, sort_order) VALUES
  (gen_random_uuid(), '<GROUP_UUID>', 'Inca Kola 500ml',    NULL, 0,    1),
  (gen_random_uuid(), '<GROUP_UUID>', 'Coca-Cola 500ml',    NULL, 0,    2),
  (gen_random_uuid(), '<GROUP_UUID>', 'Agua Cielo 500ml',   NULL, 0,    3);
*/

-- ============================================================
-- QUERY para obtener los UUIDs de los productos activos:
-- Copialo y correlo en Supabase Dashboard → SQL Editor
-- ============================================================
-- SELECT id, name FROM products WHERE is_active = true ORDER BY name;
