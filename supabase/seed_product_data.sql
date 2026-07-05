-- ============================================================
-- SEED: Product Data — Images, Tags & Option Groups
-- ============================================================
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)
-- Es IDEMPOTENTE: solo afecta productos sin datos existentes
-- ============================================================

-- ── 1. IMÁGENES ────────────────────────────────────────────
-- Actualiza productos que tienen image_src vacío
-- Usa imágenes de placeholder de comida

UPDATE products SET
  image_src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
  image_alt = name
WHERE image_src = '' OR image_src IS NULL;

-- ── 2. TAGS ────────────────────────────────────────────────
-- Tags promocionales para combos y productos destacados

UPDATE products SET tag = 'AHORRA' WHERE name IN (
  'Parrilla a Compartir',
  'Parrilla Familiar',
  'Monstrito',
  'Monstro',
  'Salchipapa Corrales',
  'Salchi Pollo'
);

-- ── 3. OPTION GROUPS ──────────────────────────────────────
-- Agrega option groups a productos tipo combo/pollo/parrilla
-- Solo si no existen ya para ese producto

-- 3a. Pollo a la Brasa (1/8, 1/4, 1/2, 1 entero)
DO $$
DECLARE
  prod RECORD;
  gid uuid;
BEGIN
  FOR prod IN
    SELECT id, name FROM products
    WHERE name IN (
      '1/8 de Pollo a la Brasa',
      '1/4 de Pollo a la Brasa',
      '1/2 Pollo a la Brasa',
      '1 Pollo a la Brasa',
      'Monstrito',
      'Monstro',
      'Chaufa de Pollo',
      'Chaufa a lo Pobre',
      'Pollito a lo Pobre',
      'Pollito Parrillero'
    )
    AND id NOT IN (
      SELECT DISTINCT product_id FROM product_option_groups
    )
  LOOP
    -- Grupo 1: Complemento (single)
    INSERT INTO product_option_groups (id, product_id, name, selection_type, min_select, max_select, is_required, sort_order)
    VALUES (gen_random_uuid(), prod.id, 'Elige tu Complemento', 'single', 1, 1, true, 1)
    RETURNING id INTO gid;

    INSERT INTO product_options (id, group_id, name, price_delta, sort_order) VALUES
      (gen_random_uuid(), gid, 'Papas Fritas',       0, 1),
      (gen_random_uuid(), gid, 'Ensalada Fresca',    0, 2),
      (gen_random_uuid(), gid, 'Puré de Papas',      0, 3);

    -- Grupo 2: Bebida (single)
    INSERT INTO product_option_groups (id, product_id, name, selection_type, min_select, max_select, is_required, sort_order)
    VALUES (gen_random_uuid(), prod.id, 'Elige tu Bebida', 'single', 1, 1, true, 2)
    RETURNING id INTO gid;

    INSERT INTO product_options (id, group_id, name, price_delta, sort_order) VALUES
      (gen_random_uuid(), gid, 'Chicha Morada',   0, 1),
      (gen_random_uuid(), gid, 'Gaseosa',         0, 2),
      (gen_random_uuid(), gid, 'Agua',            0, 3);

    -- Grupo 3: Extras (quantity)
    INSERT INTO product_option_groups (id, product_id, name, selection_type, min_select, max_select, is_required, sort_order)
    VALUES (gen_random_uuid(), prod.id, 'Agrega un Extra', 'quantity', 0, 5, false, 3)
    RETURNING id INTO gid;

    INSERT INTO product_options (id, group_id, name, price_delta, sort_order) VALUES
      (gen_random_uuid(), gid, 'Extra Pollo',     6.00, 1),
      (gen_random_uuid(), gid, 'Extra Salchicha',  3.00, 2),
      (gen_random_uuid(), gid, 'Extra Queso',      2.00, 3),
      (gen_random_uuid(), gid, 'Guacamole',        4.00, 4),
      (gen_random_uuid(), gid, 'Salsa Adicional',  1.00, 5);
  END LOOP;
END $$;

-- 3b. Parrillas
DO $$
DECLARE
  prod RECORD;
  gid uuid;
BEGIN
  FOR prod IN
    SELECT id, name FROM products
    WHERE name IN ('Parrilla a Compartir', 'Parrilla Familiar')
    AND id NOT IN (
      SELECT DISTINCT product_id FROM product_option_groups
    )
  LOOP
    INSERT INTO product_option_groups (id, product_id, name, selection_type, min_select, max_select, is_required, sort_order)
    VALUES (gen_random_uuid(), prod.id, 'Elige tu Complemento', 'single', 1, 1, true, 1)
    RETURNING id INTO gid;
    INSERT INTO product_options (id, group_id, name, price_delta, sort_order) VALUES
      (gen_random_uuid(), gid, 'Papas Fritas',      0, 1),
      (gen_random_uuid(), gid, 'Ensalada Fresca',   0, 2),
      (gen_random_uuid(), gid, 'Puré de Papas',     0, 3);

    INSERT INTO product_option_groups (id, product_id, name, selection_type, min_select, max_select, is_required, sort_order)
    VALUES (gen_random_uuid(), prod.id, 'Elige tu Bebida', 'single', 1, 1, true, 2)
    RETURNING id INTO gid;
    INSERT INTO product_options (id, group_id, name, price_delta, sort_order) VALUES
      (gen_random_uuid(), gid, 'Chicha Morada',  0, 1),
      (gen_random_uuid(), gid, 'Gaseosa',        0, 2),
      (gen_random_uuid(), gid, 'Agua',           0, 3);

    INSERT INTO product_option_groups (id, product_id, name, selection_type, min_select, max_select, is_required, sort_order)
    VALUES (gen_random_uuid(), prod.id, 'Agrega un Extra', 'quantity', 0, 5, false, 3)
    RETURNING id INTO gid;
    INSERT INTO product_options (id, group_id, name, price_delta, sort_order) VALUES
      (gen_random_uuid(), gid, 'Extra Pollo',     6.00, 1),
      (gen_random_uuid(), gid, 'Extra Salchicha', 3.00, 2),
      (gen_random_uuid(), gid, 'Extra Queso',     2.00, 3),
      (gen_random_uuid(), gid, 'Guacamole',       4.00, 4),
      (gen_random_uuid(), gid, 'Salsa Adicional', 1.00, 5);
  END LOOP;
END $$;

-- 3c. Broaster (1 Pieza, 2 Piezas)
DO $$
DECLARE
  prod RECORD;
  gid uuid;
BEGIN
  FOR prod IN
    SELECT id, name FROM products
    WHERE name IN ('1 Pieza Broaster', '2 Piezas Broaster')
    AND id NOT IN (
      SELECT DISTINCT product_id FROM product_option_groups
    )
  LOOP
    INSERT INTO product_option_groups (id, product_id, name, selection_type, min_select, max_select, is_required, sort_order)
    VALUES (gen_random_uuid(), prod.id, 'Agrega un Acompañante', 'single', 1, 1, true, 1)
    RETURNING id INTO gid;
    INSERT INTO product_options (id, group_id, name, price_delta, sort_order) VALUES
      (gen_random_uuid(), gid, 'Papas Fritas',    0, 1),
      (gen_random_uuid(), gid, 'Ensalada Fresca', 0, 2);
  END LOOP;
END $$;

-- 3d. Burgers
DO $$
DECLARE
  prod RECORD;
  gid uuid;
BEGIN
  FOR prod IN
    SELECT id, name FROM products
    WHERE name ILIKE '%Burger%' OR name ILIKE '%Hamburguesa%'
    AND id NOT IN (
      SELECT DISTINCT product_id FROM product_option_groups
    )
  LOOP
    INSERT INTO product_option_groups (id, product_id, name, selection_type, min_select, max_select, is_required, sort_order)
    VALUES (gen_random_uuid(), prod.id, 'Acompañante', 'single', 1, 1, true, 1)
    RETURNING id INTO gid;
    INSERT INTO product_options (id, group_id, name, price_delta, sort_order) VALUES
      (gen_random_uuid(), gid, 'Papas Fritas',    0, 1),
      (gen_random_uuid(), gid, 'Ensalada Fresca', 0, 2);
  END LOOP;
END $$;

-- ── 4. VERIFICACIÓN ───────────────────────────────────────
-- Productos sin imágenes
SELECT 'SIN IMAGEN' as alerta, name FROM products WHERE image_src = '' OR image_src IS NULL;

-- Productos con opciones
SELECT 'CON OPCIONES' as alerta, p.name, count(pog.id) as grupos
FROM products p
JOIN product_option_groups pog ON pog.product_id = p.id
GROUP BY p.name
ORDER BY p.name;

-- Productos SIN opciones (productos tipo bebida, tragos, etc. están bien así)
SELECT 'SIN OPCIONES' as alerta, p.name, c.name as categoria
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.id NOT IN (SELECT DISTINCT product_id FROM product_option_groups)
ORDER BY c.name, p.name;
