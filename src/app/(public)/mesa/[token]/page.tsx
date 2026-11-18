import type { Metadata } from "next";

import { TableEntry } from "@/components/mesa";

export const metadata: Metadata = {
  title: "Pedir desde tu mesa — Pollería & Fastfood Corrales",
  robots: { index: false },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <TableEntry token={token} />;
}
