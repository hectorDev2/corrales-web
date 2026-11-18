export function AppDownloadBanner() {
  return (
    <div className="relative -mx-4 mt-12 overflow-hidden md:-mx-margin-desktop">
      <div className="aspect-square md:aspect-[4.56]">
        <picture className="block h-full">
          <source media="(max-width: 767px)" srcSet="/banner-descargaapp_mobile.png" />
          <img
            src="/banner-descargaapp_desktop.webp"
            alt="Descarga la app Corrales"
            className="block h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
    </div>
  );
}
