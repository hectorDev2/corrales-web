import { CartDrawer } from "@/components/cart";
import { BottomNav, Header, LocationBanner } from "@/components/layout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="flex-1 pt-[67px] md:pt-[83px] pb-24 md:pb-0">
        {children}
      </main>
      <BottomNav />
      <LocationBanner />
    </>
  );
}
