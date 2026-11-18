-- Tema de temporada (Halloween, Navidad...) administrable desde /admin/contenido.
-- La política existente de site_settings ya permite lectura pública y escritura solo admin.
alter table public.site_settings
  add column if not exists theme jsonb not null
  default '{"mode":"none","intensity":"normal","from":null,"to":null}'::jsonb;
