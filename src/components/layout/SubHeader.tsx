"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SubHeader() {
  const pathname = usePathname();
  const isPromotionsActive = pathname === "/promociones";

  return (
    <div className="sticky top-[var(--public-mobile-header-height)] z-40 border-b border-[#e5e5e5] bg-white shadow-sm md:top-[65px]">
      <div className="mx-auto flex max-w-7xl scrollbar-none items-center gap-6 overflow-x-auto px-4 py-2.5">
        <Link
          href="/menu"
          className="text-on-surface-variant hover:text-primary hover:border-primary flex items-center gap-2 border-b-2 border-transparent pb-1 text-xs font-bold tracking-wide whitespace-nowrap transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.25em"
            height="1.25em"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M2.5 3.125h15a1.25 1.25 0 0 1 1.25 1.25v11.25a1.25 1.25 0 0 1-1.25 1.25h-15a1.25 1.25 0 0 1-1.25-1.25V4.375a1.25 1.25 0 0 1 1.25-1.25m6.875 1.25H2.5v11.25h6.875zm1.25 0v11.25H17.5V4.375zm-2.5 1.875H3.75V7.5h4.375zm8.125 0h-4.375V7.5h4.375zm0 3.125h-4.375v1.25h4.375zM11.875 12.5h4.375v1.25h-4.375zM3.75 9.375h4.375v1.25H3.75zM8.125 12.5H3.75v1.25h4.375z"
              clipRule="evenodd"
            />
          </svg>
          <h2>Carta</h2>
        </Link>
        <Link
          href="/promociones"
          aria-current={isPromotionsActive ? "page" : undefined}
          className={`flex items-center gap-2 border-b-2 pb-1 text-xs font-bold tracking-wide whitespace-nowrap transition-colors ${
            isPromotionsActive
              ? "border-primary text-primary"
              : "text-on-surface-variant hover:border-primary hover:text-primary border-transparent"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.25em"
            height="1.25em"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M7.98 1.698s.097 1.107-.05 2.47c-.112 1.038-.38 2.201-.898 3.106-.277-1.159-.966-1.921-1.599-2.574a.402.402 0 0 0-.687.243c-.197 1.624-.58 2.732-.931 3.723s-.679 1.887-.69 2.998c0 4.168 3.235 7.085 6.875 7.086 3.792 0 6.875-3.177 6.875-7.085 0-1.737-.433-3.514-1.698-5.252-.233-.32-.729-.15-.729.25 0 1.098-.405 1.737-.905 2.33-.102-1.414-.365-2.852-1.01-4.136-.797-1.59-2.1-2.93-4.023-3.591-.327-.07-.532.095-.53.432m.792.597c1.415.633 2.402 1.667 3.042 2.944.72 1.433 1.017 3.143 1.017 4.758 0 .37.435.557.69.294.611-.63 1.287-1.35 1.582-2.443.698 1.273.963 2.532.963 3.816 0 3.458-2.711 6.252-6.066 6.252-3.235 0-6.066-2.918-6.066-6.25.01-.946.289-1.72.64-2.715a19.6 19.6 0 0 0 .806-3.04c.54.616.98 1.267.98 2.419 0 .37.436.557.69.294 1.126-1.16 1.527-2.912 1.684-4.364.081-.654.073-1.349.038-1.965" />
          </svg>
          <h2>Promociones</h2>
        </Link>
        <Link
          href="/trabaja-con-nosotros"
          className="text-on-surface-variant hover:text-primary hover:border-primary flex items-center gap-2 border-b-2 border-transparent pb-1 text-xs font-bold tracking-wide whitespace-nowrap transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.25em"
            height="1.25em"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M17.5 1.25H10A1.25 1.25 0 0 0 8.75 2.5v6.25H2.5A1.25 1.25 0 0 0 1.25 10v8.75h17.5V2.5a1.25 1.25 0 0 0-1.25-1.25M5.625 17.5v-4.375h2.5V17.5zm11.875 0H9.375v-5a.625.625 0 0 0-.625-.625H5a.625.625 0 0 0-.625.625v5H2.5V10H10V2.5h7.5zM12.5 5h-1.25v1.25h1.25zM15 5h1.25v1.25H15zm-2.5 3.75h-1.25V10h1.25zm2.5 0h1.25V10H15zm-2.5 3.75h-1.25v1.25h1.25zm2.5 0h1.25v1.25H15z"
              clipRule="evenodd"
            />
          </svg>
          <h2>Ventas Corporativas</h2>
        </Link>
      </div>
    </div>
  );
}
