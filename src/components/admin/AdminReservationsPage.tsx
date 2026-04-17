"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  type Reservation,
  type ReservationStatus,
  getReservations,
  updateReservationStatus,
} from "@/lib/api/reservations";
import { supabase } from "@/lib/supabase";

const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; bg: string; text: string; icon: string }
> = {
  pendiente:  { label: "Pendiente",  bg: "bg-yellow-100", text: "text-yellow-800", icon: "schedule" },
  confirmada: { label: "Confirmada", bg: "bg-green-100",  text: "text-green-700",  icon: "event_available" },
  cancelada:  { label: "Cancelada",  bg: "bg-red-100",    text: "text-red-600",    icon: "event_busy" },
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchReservations() {
    try {
      const data = await getReservations();
      setReservations(data);
    } catch {
      toast.error("Error al cargar las reservas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservations();

    const channel = supabase
      .channel("reservations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, fetchReservations)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleStatus(id: string, status: ReservationStatus) {
    setUpdatingId(id);
    try {
      await updateReservationStatus(id, status);
      await fetchReservations();
      toast.success(`Reserva ${STATUS_CONFIG[status].label.toLowerCase()}.`);
    } catch {
      toast.error("No se pudo actualizar la reserva.");
    } finally {
      setUpdatingId(null);
    }
  }

  const pending = reservations.filter((r) => r.status === "pendiente");
  const confirmed = reservations.filter((r) => r.status === "confirmada");
  const cancelled = reservations.filter((r) => r.status === "cancelada");

  return (
    <div className="w-full max-w-2xl md:max-w-5xl lg:max-w-7xl mx-auto px-4 md:px-8 space-y-6 py-4 md:py-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-end py-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Administración
          </p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-on-surface">Reservas</h2>
        </div>
        <div className="bg-surface-container-high rounded-xl p-2 px-3 text-right">
          <p className="text-[10px] font-bold text-secondary uppercase">Pendientes</p>
          <p className="text-sm font-black text-primary">{pending.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span
            className="material-symbols-outlined text-4xl text-outline animate-spin"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
          >
            progress_activity
          </span>
        </div>
      ) : reservations.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-on-surface-variant gap-3">
          <span
            className="material-symbols-outlined text-5xl text-outline"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
          >
            event_seat
          </span>
          <p className="font-bold text-sm">Sin reservas</p>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6 md:items-start">
          <ReservationSection
            title="Pendientes"
            items={pending}
            updatingId={updatingId}
            onStatus={handleStatus}
          />
          <ReservationSection
            title="Confirmadas"
            items={confirmed}
            updatingId={updatingId}
            onStatus={handleStatus}
          />
          <ReservationSection
            title="Canceladas"
            items={cancelled}
            updatingId={updatingId}
            onStatus={handleStatus}
          />
        </div>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function ReservationSection({
  title,
  items,
  updatingId,
  onStatus,
}: {
  title: string;
  items: Reservation[];
  updatingId: string | null;
  onStatus: (id: string, status: ReservationStatus) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
        {title} ({items.length})
      </p>
      {items.map((r) => (
        <ReservationCard
          key={r.id}
          reservation={r}
          updating={updatingId === r.id}
          onStatus={onStatus}
        />
      ))}
    </section>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ReservationCard({
  reservation: r,
  updating,
  onStatus,
}: {
  reservation: Reservation;
  updating: boolean;
  onStatus: (id: string, status: ReservationStatus) => void;
}) {
  const { label, bg, text, icon } = STATUS_CONFIG[r.status];
  const whatsappHref = `https://wa.me/51${r.customer_phone.replace(/\s/g, "")}`;

  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-[0_4px_20px_rgba(89,65,61,0.07)] overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-on-secondary-container text-lg"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              event_seat
            </span>
          </div>
          <div>
            <p className="text-sm font-black text-on-surface">{r.customer_name}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-secondary font-bold hover:underline"
            >
              {r.customer_phone}
            </a>
          </div>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>
          <span
            className="material-symbols-outlined text-[10px]"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            {icon}
          </span>
          {label}
        </span>
      </div>

      {/* Details */}
      <div className="px-4 pb-3 grid grid-cols-3 gap-2">
        <Detail icon="calendar_month" label="Fecha" value={formatDate(r.date)} />
        <Detail icon="schedule" label="Hora" value={r.time} />
        <Detail icon="group" label="Personas" value={String(r.guests)} />
      </div>

      {r.notes && (
        <div className="px-4 pb-3">
          <p className="text-[11px] text-on-surface-variant italic bg-surface-container-low rounded-xl px-3 py-2 leading-snug">
            &ldquo;{r.notes}&rdquo;
          </p>
        </div>
      )}

      {/* Actions */}
      {r.status !== "cancelada" && (
        <div className="px-4 pb-4 flex gap-2">
          {r.status === "pendiente" && (
            <button
              onClick={() => onStatus(r.id, "confirmada")}
              disabled={updating}
              className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 transition active:scale-95 disabled:opacity-50"
            >
              Confirmar
            </button>
          )}
          <button
            onClick={() => onStatus(r.id, "cancelada")}
            disabled={updating}
            className="flex-1 py-2.5 rounded-xl bg-error-container text-error text-[11px] font-bold uppercase tracking-wider transition active:scale-95 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

function Detail({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-2 text-center">
      <span
        className="material-symbols-outlined text-secondary text-base block"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
      >
        {icon}
      </span>
      <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">{label}</p>
      <p className="text-[11px] font-black text-on-surface leading-tight mt-0.5 capitalize">{value}</p>
    </div>
  );
}
