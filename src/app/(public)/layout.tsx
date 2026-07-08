import { CartDrawer } from "@/components/cart";
import { FloatingActions, Footer, Header, LocationBanner, LocationModal, SubHeader } from "@/components/layout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <SubHeader />
      <CartDrawer />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingActions />
      <LocationModal />
      <LocationBanner />
    </>
  );
}
