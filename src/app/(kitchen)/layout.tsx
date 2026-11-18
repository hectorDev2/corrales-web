import { LogoutButton } from "@/components/auth/LogoutButton";

export const dynamic = "force-dynamic";

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface min-h-screen">
      <header className="bg-surface/95 border-outline-variant/10 fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b px-4 backdrop-blur-sm">
        <span className="text-on-surface text-lg font-black tracking-tighter">
          Corrales <span className="text-primary">Cocina</span>
        </span>
        <LogoutButton />
      </header>
      <main className="pt-16">{children}</main>
    </div>
  );
}
