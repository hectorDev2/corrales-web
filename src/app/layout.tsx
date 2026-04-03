import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { CartDrawer } from "@/components/cart";
import { BottomNav, Header } from "@/components/layout";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pollería & Fastfood Corrales",
  description:
    "Recetas familiares de generación en generación. Pollo a la brasa, parrillas y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      {/* Material Symbols Outlined — icon font (React 19 hoist) */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <body className="min-h-full flex flex-col bg-background">
        <Header />
        {/* pt-[67px] = top accent bar (3px) + header (h-16=64px) */}
        <main className="flex-1 pt-[67px] md:pt-[83px] pb-24 md:pb-0">
          {children}
        </main>
        <BottomNav />
        <CartDrawer />
      </body>
    </html>
  );
}
