import { CartDrawer } from "@/components/cart";
import { FloatingActions, Footer, Header, LocationBanner } from "@/components/layout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="flex-1 pt-[72px]">
        {children}
      </main>
      <Footer />
      <FloatingActions />
      <LocationBanner />
    </>
  );
}
