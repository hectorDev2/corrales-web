-- PASO 1 de 2: agrega el perfil "cocina".
-- Ejecuta este archivo SOLO; luego ejecuta 20261119000005_kitchen_role_policies.sql.
-- (Postgres no permite usar un valor de enum nuevo en la misma transacción en que se crea.)
alter type public.user_role add value if not exists 'cocina';
