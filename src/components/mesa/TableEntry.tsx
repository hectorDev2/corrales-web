"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getTableByToken } from "@/lib/api/tables";
import { useCartStore } from "@/store/cart";
import { useTableSession } from "@/store/table-session";

export function TableEntry({ token }: { token: string }) {
  const router = useRouter();
  const setTable = useTableSession((s) => s.setTable);
  const [status, setStatus] = useState<"loading" | "invalid">("loading");

  useEffect(() => {
    let cancelled = false;
    getTableByToken(token)
      .then((table) => {
        if (cancelled) return;
        if (!table) {
          setStatus("invalid");
          return;
        }
        // Cambiar de mesa no debe arrastrar el carrito de otra sesión.
        const current = useTableSession.getState().table;
        if (current && current.token !== token) useCartStore.getState().clearCart();
        setTable({ token, label: table.label, zone: table.zone });
        router.replace("/menu");
      })
      .catch(() => !cancelled && setStatus("invalid"));
    return () => {
      cancelled = true;
    };
  }, [token, router, setTable]);

  if (status === "invalid") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center">
        <span className="material-symbols-outlined text-outline text-6xl">qr_code_scanner</span>
        <h1 className="text-on-surface text-2xl font-black tracking-tighter">
          Este código QR no es válido
        </h1>
        <p className="text-on-surface-variant">
          La mesa no existe o su código fue reemplazado. Pide ayuda al personal.
        </p>
        <Link href="/menu" className="bg-primary text-on-primary rounded-xl px-6 py-3 font-bold">
          Ver la carta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-24 text-on-surface-variant">
      <span className="material-symbols-outlined text-outline animate-spin text-4xl">
        progress_activity
      </span>
      <p className="text-sm font-bold">Abriendo tu mesa…</p>
    </div>
  );
}
