-- ============================================================
-- Site Settings — configuración global del sitio
-- ============================================================

create table site_settings (
  id        int  primary key default 1,
  footer    jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

-- Solo una fila (id=1) mediante upsert
insert into site_settings (id, footer) values (1, '{
  "aboutText": "Pollería & Fastfood. Recetas familiares que han pasado de generación en generación.",
  "whatsapp": "51999999999",
  "email": "corrales@contacto.pe",
  "address": "Av. La Marina 1234, Lima",
  "sections": [
    {
      "title": "Contacto",
      "links": [
        { "label": "WhatsApp", "href": "https://wa.me/51999999999" },
        { "label": "corrales@contacto.pe", "href": "mailto:corrales@contacto.pe" },
        { "label": "Av. La Marina 1234, Lima", "href": "#" }
      ]
    },
    {
      "title": "Sobre Nosotros",
      "links": [
        { "label": "Nuestra Historia", "href": "/nosotros" },
        { "label": "Trabaja con Nosotros", "href": "/trabaja-con-nosotros" },
        { "label": "Locales", "href": "#" }
      ]
    },
    {
      "title": "Políticas",
      "links": [
        { "label": "Términos y Condiciones", "href": "#" },
        { "label": "Política de Privacidad", "href": "#" },
        { "label": "Libro de Reclamaciones", "href": "#" }
      ]
    }
  ],
  "social": {
    "facebook": "#",
    "instagram": "#",
    "tiktok": "#"
  }
}'::jsonb)
on conflict (id) do nothing;
