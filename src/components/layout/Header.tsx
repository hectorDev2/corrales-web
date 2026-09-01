import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase-server";

import { HeaderClient } from "./HeaderClient";
import { LocationButton } from "./LocationButton";
import { MobileNav } from "./MobileNav";
import { PublicHeaderHeightSync } from "./PublicHeaderHeightSync";
import { SearchBar } from "./SearchBar";

export async function Header() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header data-public-header className="bg-primary sticky top-0 z-50 shadow-md">
      <PublicHeaderHeightSync />
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 md:flex-row md:items-center md:gap-3">
        {/* Row 1: hamburger + logo + mobile actions */}
        <div className="flex items-center justify-between md:w-auto">
          <div className="flex shrink-0 items-center gap-2">
            <MobileNav isAdmin={isAdmin} />
            <Link href="/" className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-2xl text-white"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                local_fire_department
              </span>
              <span className="text-base font-black tracking-tight text-white uppercase leading-none">
                Corrales
              </span>
            </Link>
          </div>
          <div className="flex md:hidden">
            <HeaderClient isAdmin={isAdmin} mobileOnly />
          </div>
        </div>

        {/* Row 2: search + desktop actions */}
        <div className="flex items-center gap-3 w-full md:flex-1">
          {/* Search bar */}
          <SearchBar />

          {/* Location (desktop only) */}
          <LocationButton />

          {/* Actions: account + cart + notifications (desktop) */}
          <div className="hidden md:flex">
            <HeaderClient isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </header>
  );
}
