export interface NavItem {
  href: string;
  icon: string;
  label: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Operación",
    items: [
      { href: "/admin", icon: "receipt_long", label: "Pedidos" },
      { href: "/admin/mesas", icon: "table_restaurant", label: "Mesas" },
      { href: "/admin/reservas", icon: "event_seat", label: "Reservas" },
      { href: "/admin/historial", icon: "history", label: "Historial" },
      { href: "/admin/facturacion", icon: "receipt", label: "Facturación" },
    ],
  },
  {
    title: "Catálogo",
    items: [
      { href: "/admin/productos", icon: "restaurant_menu", label: "Productos" },
      { href: "/admin/categorias", icon: "category", label: "Categorías" },
    ],
  },
  {
    title: "Sitio",
    items: [
      { href: "/admin/contenido", icon: "edit_note", label: "Contenido" },
      { href: "/admin/usuarios", icon: "group", label: "Usuarios" },
    ],
  },
];

/** Accesos fijos de la barra inferior en móvil; el resto vive en «Más». */
export const MOBILE_PRIMARY: NavItem[] = [
  NAV_GROUPS[0].items[0], // Pedidos
  NAV_GROUPS[0].items[1], // Mesas
  NAV_GROUPS[1].items[0], // Productos
];

export function isNavActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}
