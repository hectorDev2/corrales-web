import { LogoutButton } from "@/components/auth/LogoutButton";

export function AdminHeader() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-[0_12px_40px_rgba(89,65,61,0.08)]">
      <div className="flex justify-between items-center px-4 h-16 w-full max-w-screen-sm mx-auto">
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
