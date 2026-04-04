import { LogoutButton } from "@/components/auth/LogoutButton";

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/10 flex items-center justify-between px-4">
        <span className="font-black tracking-tighter text-on-surface">
          Corrales <span className="text-primary">Delivery</span>
        </span>
        <LogoutButton />
      </header>
      <main className="pt-16">{children}</main>
    </div>
  );
}
