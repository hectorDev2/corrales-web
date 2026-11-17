import { CartDrawer } from "@/components/cart";
import { TableBanner } from "@/components/mesa";
import {
  AnnouncementBar,
  BottomNav,
  Header,
  LocationBanner,
  LocationModal,
  PublicFooter,
  SubHeader,
} from "@/components/layout";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TableBanner />
      <AnnouncementBar />
      <Header />
      <SubHeader />
      <CartDrawer />
      <main className="flex-1 pb-[72px] md:pb-0">{children}</main>
      <PublicFooter />
      <BottomNav />
      <LocationModal />
      <LocationBanner />
    </>
  );
}
