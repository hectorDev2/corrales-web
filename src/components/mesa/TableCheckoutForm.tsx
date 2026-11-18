"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { OrderSummary } from "@/components/checkout/OrderSummary";
import { createTableOrder } from "@/lib/api/tables";
import { useCartStore } from "@/store/cart";
import { useTableSession } from "@/store/table-session";

const noopSubscribe = () => () => {};

export function TableCheckoutForm() {
  const router = useRouter();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const table = useTableSession((s) => s.table);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sentOrder, setSentOrder] = useState<number | null>(null);

  if (!mounted) return null;
  if (!table) return null;

  if (sentOrder !== null) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center">
        <span className="material-symbols-outlined text-success text-6xl">check_circle</span>
        <h1 className="text-on-surface text-2xl font-black tracking-tighter">
          ¡Pedido #{sentOrder} enviado a cocina!
        </h1>
        <p className="text-on-surface-variant">
          Lo llevaremos a la Mesa {table.label}. El pago se realiza en caja al terminar.
        </p>
        <Link href="/menu" className="bg-primary text-on-primary rounded-xl px-6 py-3 font-bold">
          Pedir algo más
        </Link>
      </div>
    );
  }

  async function handleSend() {
    if (!table || items.length === 0) return;
    setSending(true);
    try {
      const orderNumber = await createTableOrder({
        tableToken: table.token,
        customerName: name.trim(),
        customerNotes: notes.trim(),
        items,
      });
      clearCart();
      setSentOrder(orderNumber);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos enviar el pedido.");
    } finally {
      setSending(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center">
        <h1 className="text-on-surface text-2xl font-black tracking-tighter">Tu pedido está vacío</h1>
        <button
          type="button"
          onClick={() => router.push("/menu")}
          className="bg-primary text-on-primary rounded-xl px-6 py-3 font-bold"
        >
          Ver la carta
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-on-surface mb-2 text-3xl font-black tracking-tighter">
          Pedido para la Mesa {table.label}
        </h1>
        <p className="text-on-surface-variant leading-relaxed">
          Tu pedido llega directo a cocina y te lo llevamos a la mesa. Pagas en caja al terminar.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
        <section className="shadow-card space-y-6 rounded-3xl bg-white p-6">
          <div className="space-y-1.5">
            <label
              htmlFor="table-name"
              className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase"
            >
              Tu nombre <span className="font-normal normal-case">(opcional)</span>
            </label>
            <input
              id="table-name"
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Juan"
              className="bg-surface-container-high focus:ring-primary/20 placeholder:text-outline text-on-surface w-full rounded-xl border-none px-4 py-4 focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="table-notes"
              className="text-on-surface-variant ml-1 text-xs font-bold tracking-widest uppercase"
            >
              Notas del pedido
            </label>
            <textarea
              id="table-notes"
              value={notes}
              maxLength={200}
              rows={3}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Sin cremas, salsa aparte"
              className="bg-surface-container-high focus:ring-primary/20 placeholder:text-outline text-on-surface w-full resize-none rounded-xl border-none px-4 py-4 focus:ring-2 focus:outline-none"
            />
          </div>
        </section>

        <aside className="space-y-6 md:sticky md:top-24">
          <OrderSummary />
          <button
            type="button"
            disabled={sending}
            onClick={() => void handleSend()}
            className="bg-primary text-on-primary shadow-primary/30 flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg font-black tracking-tight shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Enviando…" : "Enviar pedido a cocina"}
          </button>
        </aside>
      </div>
    </div>
  );
}
