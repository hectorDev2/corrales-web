import { AdminBottomNav, AdminHeader } from "@/components/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminHeader />
      <main className="flex-1 pt-20 pb-28">{children}</main>
      <AdminBottomNav />
    </>
  );
}
