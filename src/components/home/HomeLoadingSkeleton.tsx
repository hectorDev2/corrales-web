import type { CSSProperties } from "react";

type SkeletonProps = {
  className: string;
  delay: number;
};

function Skeleton({ className, delay }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`home-skeleton-cascade ${className}`}
      data-home-skeleton
      style={{ "--skeleton-delay": `${delay * 100}ms` } as CSSProperties}
    />
  );
}

function ProductRow({ delay }: { delay: number }) {
  return (
    <section className="py-12" aria-hidden="true">
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-8 w-52" delay={delay} />
        <Skeleton className="h-5 w-20" delay={delay + 1} />
      </div>
      <div className="flex gap-3 md:gap-6">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-72 min-w-[calc(50%-6px)] md:min-w-[calc(33.333%-16px)] lg:min-w-[calc(20%-1.2rem)]"
            delay={delay + index + 2}
          />
        ))}
      </div>
    </section>
  );
}

export function HomeLoadingSkeleton() {
  return (
    <div
      className="md:px-margin-desktop mx-auto max-w-[1280px] overflow-hidden px-4"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Cargando inicio"
    >
      <span className="sr-only">Cargando inicio</span>

      <Skeleton className="md:-mx-margin-desktop -mx-4 mt-4 h-44 md:h-64" delay={0} />
      <ProductRow delay={1} />

      <section className="md:-mx-margin-desktop -mx-4 bg-[#f5f5f5] px-6 py-6" aria-hidden="true">
        <div className="mb-7 flex items-center justify-between">
          <Skeleton className="h-5 w-48" delay={8} />
          <Skeleton className="h-4 w-16" delay={9} />
        </div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[70px]" delay={index + 10} />
          ))}
        </div>
      </section>

      <ProductRow delay={14} />
      <Skeleton className="md:-mx-margin-desktop -mx-4 mt-12 h-28 md:h-48" delay={21} />
    </div>
  );
}
