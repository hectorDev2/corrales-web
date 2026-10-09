import { CartDrawer } from "@/components/cart";
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
