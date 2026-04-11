import { HeroSection, HomeSlider } from "@/components/home";
import { getSlides } from "@/lib/api/slider";

export default async function Home() {
  const slides = await getSlides();

  return (
    <>
      <HomeSlider slides={slides} />
      <HeroSection />
    </>
  );
}
