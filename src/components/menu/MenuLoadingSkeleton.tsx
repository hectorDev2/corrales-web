import type { CSSProperties } from "react";

type SkeletonProps = {
  className: string;
  delay: number;
  testId?: string;
};

function Skeleton({ className, delay, testId = "menu-loading-cascade" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`menu-skeleton-cascade ${className}`}
      data-testid={testId}
      style={{ "--skeleton-delay": `${delay * 100}ms` } as CSSProperties}
    />
  );
}

function ProductCard({ delay }: { delay: number }) {
  const cascadeDelay = (offset: number) => (delay + offset) % 6;

  return (
    <article
      aria-hidden="true"
      className="overflow-hidden rounded-md border border-[#ececec] bg-white"
      data-testid="menu-loading-product-card"
    >
      <Skeleton
        className="aspect-square w-full rounded-none"
        delay={cascadeDelay(0)}
        testId="menu-loading-card-image"
      />
      <div className="space-y-2 px-3 pt-3 pb-2.5 sm:px-4">
        <Skeleton className="h-5 w-4/5" delay={cascadeDelay(1)} />
        <Skeleton className="h-3 w-full" delay={cascadeDelay(2)} />
        <Skeleton className="h-3 w-3/5" delay={cascadeDelay(3)} />
        <div className="flex items-end justify-between pt-1">
          <Skeleton className="h-6 w-16" delay={cascadeDelay(4)} />
          <Skeleton className="size-8" delay={cascadeDelay(5)} />
        </div>
      </div>
    </article>
  );
}

export function MenuLoadingSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" aria-label="Cargando carta">
      <span className="sr-only">Cargando carta</span>

      <nav
        aria-hidden="true"
        className="border-b border-[#e9e9e9]"
        data-testid="menu-loading-category-strip"
      >
        <div className="mx-auto flex max-w-7xl gap-7 overflow-hidden px-4 md:px-8">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton
              key={index}
              className={`my-4 h-5 shrink-0 ${index === 0 ? "w-16" : "w-24"}`}
              delay={index}
            />
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pt-8 pb-14 md:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="mb-7 flex flex-col gap-4 border-b border-[#f0f0f0] pb-5 sm:flex-row sm:items-center sm:justify-between"
          data-testid="menu-loading-controls"
        >
          <Skeleton className="h-5 w-28" delay={7} />
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <Skeleton className="hidden h-7 w-16 md:block" delay={8} />
            <Skeleton className="h-5 w-20" delay={9} />
          </div>
        </div>

        <section
          aria-hidden="true"
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
          data-testid="menu-loading-grid"
        >
          {Array.from({ length: 12 }, (_, index) => (
            <ProductCard key={index} delay={index % 6} />
          ))}
        </section>
      </main>
    </div>
  );
}
