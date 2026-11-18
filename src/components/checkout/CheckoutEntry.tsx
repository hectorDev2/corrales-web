"use client";

import { useSyncExternalStore } from "react";

import { TableCheckoutForm } from "@/components/mesa/TableCheckoutForm";
import { useTableSession } from "@/store/table-session";

import { CheckoutForm } from "./CheckoutForm";

const noopSubscribe = () => () => {};

/** Elige el checkout de mesa (QR) o el de delivery/recojo según la sesión. */
export function CheckoutEntry() {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const table = useTableSession((s) => s.table);

  if (mounted && table) return <TableCheckoutForm />;
  return <CheckoutForm />;
}
