import { CartDrawer } from "@/components/cart";
import { FloatingActions, Header, LocationBanner } from "@/components/layout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="flex-1 pt-[67px] md:pt-[83px]">
        {children}
      </main>
      <FloatingActions />
      <LocationBanner />
    </>
  );
}
