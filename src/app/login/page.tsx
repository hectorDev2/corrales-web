import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Acceso — Pollería Corrales",
};

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <LoginForm />
    </div>
  );
}
