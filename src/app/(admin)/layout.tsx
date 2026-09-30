import { AdminBottomNav, AdminHeader } from "@/components/admin";

// Admin pages load Supabase data on the server and must not be prerendered during Vercel builds.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader />
      <main className="flex-1 pt-20 pb-28">{children}</main>
      <AdminBottomNav />
    </>
  );
}
