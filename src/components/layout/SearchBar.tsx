"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";

function highlightTerm(text: string, term: string) {
  if (!term.trim()) return text;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <span key={i} className="font-bold text-primary">{part}</span>
    ) : (
      part
    ),
  );
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
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
    const first = products[0];
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
      setProducts([]);
      setOpen(false);
      return;
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const term = value.trim();
      const q = `%${term}%`;

      const { data: catData } = await supabase
        .from("categories")
        .select("id")
        .eq("is_active", true)
        .ilike("name", q)
        .limit(4);

      const matchedIds = (catData ?? []).map((c) => c.id);

      let prodQuery = supabase
        .from("products")
        .select(`id, name, description, image_src, tag, category_id, product_variants ( id, price )`)
        .eq("is_active", true);

      const orParts = [`name.ilike.${q}`, `description.ilike.${q}`];
      if (matchedIds.length > 0) {
        orParts.push(`category_id.in.(${matchedIds.join(",")})`);
      }
      prodQuery = prodQuery.or(orParts.join(","));

      const { data: prodData } = await prodQuery.limit(8);

      if (prodData) {
        setProducts(
          prodData.map((r) => {
            const variants = (r.product_variants as Array<{ id: string; price: number }>) ?? [];
            return {
              id: r.id,
              name: r.name,
              description: r.description ?? "",
              image: { src: r.image_src ?? "", alt: r.name },
              tag: r.tag,
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
          placeholder="Buscar productos..."
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && products.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#e5e5e5] overflow-hidden z-50 md:max-w-md">
          <p className="px-4 pt-3 pb-1 text-xs font-bold text-on-surface-variant/60">
            Posibles coincidencias
          </p>
          <div className="divide-y divide-[#e5e5e5]">
            {products.map((product) => {
              const variant = product.variants[0];
              const lastVariant = product.variants[product.variants.length - 1];
              const hasRange = lastVariant && lastVariant.price > (variant?.price ?? 0);

              return (
                <div
                  key={product.id}
                  id={`btn-search-${product.id}`}
                  className="search-result-item"
                >
                  <a
                    href={`/producto/${product.id}`}
                    onClick={() => { setOpen(false); setQuery(""); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f5] transition-colors"
                  >
                    {product.image.src && (
                      <img
                        alt={product.image.alt}
                        className="search-result-item__image w-16 h-16 rounded-lg object-cover shrink-0 bg-[#f5f5f5]"
                        src={product.image.src}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111] leading-tight search-result-item__text">
                        {highlightTerm(product.name, query)}
                      </p>
                      <div className="mt-0.5">
                        {product.tag && hasRange && (
                          <p className="text-[11px] text-primary font-bold search-result-item__discount">
                            {product.tag}{" "}
                            <span className="text-[10px] text-secondary line-through font-normal">
                              S/ {lastVariant.price.toFixed(2)}
                            </span>
                          </p>
                        )}
                        <p className="text-sm font-bold text-primary search-result-item__price">
                          S/ {(variant?.price ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-primary shrink-0">
                      Ver más
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
          {query.trim() && (
            <a
              href={`/menu?q=${encodeURIComponent(query.trim())}`}
              onClick={() => { setOpen(false); setQuery(""); }}
              className="block w-full text-center py-3 text-xs font-bold text-primary hover:bg-[#f5f5f5] transition-colors border-t border-[#e5e5e5]"
            >
              Ver más productos
            </a>
          )}
        </div>
      )}
    </div>
  );
}
