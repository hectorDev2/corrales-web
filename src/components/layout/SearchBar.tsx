"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Enter") return;
    const first = results[0];
    if (first) {
      router.push(`/producto/${first.id}`);
      setOpen(false);
      setQuery("");
    } else if (query.trim()) {
      router.push(`/menu?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const q = `%${value.trim()}%`;
      const { data } = await supabase
        .from("products")
        .select(`
          id, name, image_src,
          product_variants ( id, price )
        `)
        .eq("is_active", true)
        .or(`name.ilike.${q},description.ilike.${q}`)
        .limit(8);

      if (data) {
        setResults(
          data.map((r) => {
            const variants = (r.product_variants as Array<{ id: string; price: number }>) ?? [];
            return {
              id: r.id,
              name: r.name,
              description: "",
              image: { src: r.image_src ?? "", alt: r.name },
              category: "",
              variants: variants.length > 0
                ? variants.map((v) => ({ id: v.id, label: null, price: v.price, sort_order: 0 }))
                : [{ id: "", label: null, price: 0, sort_order: 0 }],
            } as Product;
          }),
        );
        setOpen(true);
      }
    }, 300);
  }

  return (
    <div ref={ref} className="flex flex-1 min-w-0 items-center relative">
      <div className="flex w-full items-center rounded-full bg-white px-3 py-1.5 text-secondary ring-1 ring-white/20 transition-all has-[input:focus]:ring-primary md:max-w-md">
        <button type="button" className="mr-2 flex items-center" aria-label="Buscar">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m21.53 20.47-4.693-4.694a8.26 8.26 0 1 0-1.06 1.06l4.692 4.695a.75.75 0 1 0 1.062-1.062M3.75 10.5a6.75 6.75 0 1 1 6.75 6.75 6.76 6.76 0 0 1-6.75-6.75" />
          </svg>
        </button>
        <input
          className="w-full border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-secondary/60"
          placeholder="Buscar..."
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#e5e5e5] overflow-hidden z-50 md:max-w-md">
          {results.map((product) => {
            const v = product.variants[0];
            return (
              <Link
                key={product.id}
                href={`/producto/${product.id}`}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f5] transition-colors border-b border-[#e5e5e5] last:border-0"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#f5f5f5]">
                  <img
                    src={product.image.src}
                    alt={product.image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111] truncate">{product.name}</p>
                </div>
                {v && (
                  <span className="text-sm font-bold text-primary shrink-0">
                    S/ {v.price.toFixed(2)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
