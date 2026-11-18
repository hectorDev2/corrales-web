"use client";

import { usePathname } from "next/navigation";

import { Footer } from "./Footer";

export function PublicFooter() {
  const pathname = usePathname();
  const isProductDetail = pathname.startsWith("/producto/");

  return isProductDetail ? null : <Footer />;
}
