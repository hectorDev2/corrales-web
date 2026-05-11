"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Credenciales incorrectas. Verificá tu email y contraseña.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", (await supabase.auth.getUser()).data.user!.id)
      .single();

    router.push(profile?.role === "delivery" ? "/delivery" : "/admin");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-on-surface">
          Pollería Corrales
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">Acceso al panel</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-8 shadow-card space-y-5"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="correo@ejemplo.com"
            className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-outline"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary font-black py-4 rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all tracking-tight disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
