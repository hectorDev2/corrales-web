"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createDeliveryUser,
  getDeliveryUsers,
  toggleDeliveryUser,
  type DeliveryUser,
} from "@/lib/api/users";

const EMPTY_FORM = { full_name: "", email: "", password: "", phone: "" };

export function AdminUsersPage() {
  const [users, setUsers] = useState<DeliveryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function fetchUsers() {
    try {
      const data = await getDeliveryUsers();
      setUsers(data);
    } catch {
      toast.error("Error al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleCreate() {
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Nombre, email y contraseña son obligatorios.");
      return;
    }
    setCreating(true);
    try {
      await createDeliveryUser({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        phone: form.phone.trim() || undefined,
      });
      toast.success(`Usuario "${form.full_name.trim()}" creado correctamente.`);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear el usuario.");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(user: DeliveryUser) {
    const action = user.is_active ? "desactivar" : "activar";
    if (!confirm(`¿Querés ${action} a ${user.full_name}?`)) return;
    try {
      await toggleDeliveryUser(user.id, !user.is_active);
      toast.success(user.is_active ? "Usuario desactivado." : "Usuario activado.");
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar el usuario.");
    }
  }

  const active = users.filter((u) => u.is_active);
  const inactive = users.filter((u) => !u.is_active);

  return (
    <div className="w-full max-w-97.5 mx-auto px-4 space-y-6 py-4 pb-28">
      {/* Header */}
      <div className="flex justify-between items-end py-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">
            Panel de Control
          </p>
          <h2 className="text-2xl font-black tracking-tighter text-on-surface">
            Repartidores
          </h2>
        </div>
        <div className="bg-surface-container-high rounded-xl p-2 px-3 text-right">
          <p className="text-[10px] font-bold text-secondary uppercase">Activos</p>
          <p className="text-sm font-black text-primary">{active.length}</p>
        </div>
      </div>

      {/* Botón nuevo usuario */}
      <button
        onClick={() => setShowForm((v) => !v)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container transition-all hover:border-primary hover:bg-primary/5 active:scale-[0.98]"
      >
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          {showForm ? "close" : "person_add"}
        </span>
        <span className="font-bold text-sm text-on-surface">
          {showForm ? "Cancelar" : "Nuevo repartidor"}
        </span>
      </button>

      {/* Formulario de creación */}
      {showForm && (
        <div className="bg-surface-container-low p-5 rounded-3xl space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
            Datos del repartidor
          </p>

          <div className="space-y-3">
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Nombre completo"
              className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Correo electrónico"
              className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Contraseña"
                className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 pr-12 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Teléfono (opcional)"
              className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-on-primary font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              {creating ? "progress_activity" : "person_add"}
            </span>
            {creating ? "Creando..." : "Crear repartidor"}
          </button>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span
            className="material-symbols-outlined text-4xl text-outline animate-spin"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
          >
            progress_activity
          </span>
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-on-surface-variant gap-3">
          <span
            className="material-symbols-outlined text-5xl text-outline"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}
          >
            group
          </span>
          <p className="font-bold text-sm">Sin repartidores registrados</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Activos */}
          {active.length > 0 && (
            <section className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">
                Activos ({active.length})
              </p>
              {active.map((user) => (
                <UserCard key={user.id} user={user} onToggle={handleToggle} />
              ))}
            </section>
          )}

          {/* Inactivos */}
          {inactive.length > 0 && (
            <section className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant px-1">
                Desactivados ({inactive.length})
              </p>
              {inactive.map((user) => (
                <UserCard key={user.id} user={user} onToggle={handleToggle} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function UserCard({
  user,
  onToggle,
}: {
  user: DeliveryUser;
  onToggle: (user: DeliveryUser) => void;
}) {
  const initials = user.full_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(89,65,61,0.06)] p-4 flex items-center gap-3 transition-opacity ${!user.is_active ? "opacity-50" : ""}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-sm ${user.is_active ? "bg-primary/10 text-primary" : "bg-surface-container-high text-outline"}`}>
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-on-surface truncate">{user.full_name}</p>
          {!user.is_active && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-surface-container-highest text-outline shrink-0">
              Inactivo
            </span>
          )}
        </div>
        {user.phone && (
          <p className="text-[11px] text-on-surface-variant">{user.phone}</p>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggle(user)}
        title={user.is_active ? "Desactivar" : "Activar"}
        className={`p-2 rounded-xl transition-all active:scale-90 ${
          user.is_active
            ? "text-error hover:bg-error-container"
            : "text-primary hover:bg-primary/10"
        }`}
      >
        <span
          className="material-symbols-outlined text-lg"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          {user.is_active ? "person_off" : "person_check"}
        </span>
      </button>
    </div>
  );
}
