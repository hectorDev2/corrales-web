"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/menu?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/menu");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md mx-auto">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="m21.53 20.47-4.693-4.694a8.26 8.26 0 1 0-1.06 1.06l4.692 4.695a.75.75 0 1 0 1.062-1.062M3.75 10.5a6.75 6.75 0 1 1 6.75 6.75 6.76 6.76 0 0 1-6.75-6.75" />
        </svg>
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar..."
        className="w-full h-10 pl-10 pr-4 rounded-full bg-white/15 text-white placeholder:text-white/50 text-sm focus:outline-none focus:bg-white/25 focus:ring-2 focus:ring-white/30 transition-all"
      />
    </form>
  );
}
