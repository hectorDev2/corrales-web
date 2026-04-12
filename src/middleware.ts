import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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
  const isProtected     = isAdminRoute || isDeliveryRoute;
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

    // En login → redirigir a su panel
    if (isLogin) {
      const dest = role === "admin" ? "/admin" : "/delivery";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Delivery intentando entrar a /admin → redirigir a /delivery
    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/delivery", request.url));
    }

    // Admin intentando entrar a /delivery → redirigir a /admin
    if (isDeliveryRoute && role !== "delivery") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/delivery/:path*", "/login"],
};
