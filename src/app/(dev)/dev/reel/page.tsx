import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReelBuilder } from "@/components/reel";

export const metadata: Metadata = {
  title: "Reel Builder — Corrales",
  robots: { index: false, follow: false },
};

export default function ReelPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <ReelBuilder />;
}
