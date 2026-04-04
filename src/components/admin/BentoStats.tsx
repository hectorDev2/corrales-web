import type { Order } from "@/types/order";

interface Props {
  orders: Order[];
}

export function BentoStats({ orders }: Props) {
  const inOven = orders.filter((o) => o.status === "preparando").length;
  const onTheWay = orders.filter(
    (o) => o.status === "listo" && o.deliveryType === "delivery",
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-tertiary-fixed rounded-3xl p-4 flex flex-col justify-between h-32 relative overflow-hidden">
        <span
          className="material-symbols-outlined text-tertiary/20 absolute -right-2 -bottom-2 text-6xl"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
        >
          local_fire_department
        </span>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-tertiary-fixed">
          Pollos en Horno
        </p>
        <p className="text-4xl font-black text-on-tertiary-fixed">
          {String(inOven).padStart(2, "0")}
        </p>
      </div>

      <div className="bg-secondary-fixed rounded-3xl p-4 flex flex-col justify-between h-32 relative overflow-hidden">
        <span
          className="material-symbols-outlined text-secondary/20 absolute -right-2 -bottom-2 text-6xl"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
        >
          delivery_dining
        </span>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-secondary-fixed">
          En Camino
        </p>
        <p className="text-4xl font-black text-on-secondary-fixed">
          {String(onTheWay).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
