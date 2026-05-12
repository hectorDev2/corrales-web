import { LogoutButton } from "@/components/auth/LogoutButton";

export function AdminHeader() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-4 h-16 w-full max-w-2xl md:max-w-5xl lg:max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            admin_panel_settings
          </span>
          <h1 className="text-xl font-black text-primary uppercase tracking-tight">
            Corrales Admin
          </h1>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
