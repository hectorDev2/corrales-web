import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute    = pathname.startsWith("/admin");
  const isDeliveryRoute = pathname.startsWith("/delivery");
  const isKitchenRoute  = pathname.startsWith("/cocina");
  const isProtected     = isAdminRoute || isDeliveryRoute || isKitchenRoute;
  const isLogin         = pathname === "/login";

  // Sin sesión → redirigir a login
  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Con sesión → obtener rol una sola vez para verificar acceso
  if (user && (isProtected || isLogin)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "delivery";
    const home = role === "admin" ? "/admin" : role === "cocina" ? "/cocina" : "/delivery";

    // En login → redirigir a su panel
    if (isLogin) {
      return NextResponse.redirect(new URL(home, request.url));
    }

    // Cada perfil solo entra a su propio panel
    if (
      (isAdminRoute && role !== "admin") ||
      (isDeliveryRoute && role !== "delivery") ||
      (isKitchenRoute && role !== "cocina")
    ) {
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/delivery/:path*", "/cocina/:path*", "/login"],
};
