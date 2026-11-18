import { redirect } from "next/navigation";

// Slider y footer ahora viven como pestañas dentro de Contenido.
export default function Page() {
  redirect("/admin/contenido");
}
