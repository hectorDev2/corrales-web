import Image from "next/image";
import Link from "next/link";

import { DEFAULT_HOME_SAVINGS_SETTINGS, type HomeSavingsSettings } from "@/lib/api/settings";

interface Props {
  settings?: HomeSavingsSettings;
}

export function SavingsCategories({ settings = DEFAULT_HOME_SAVINGS_SETTINGS }: Props) {
  const activeTiles = settings.tiles
    .filter((tile) => tile.isActive)
    .sort((first, second) => first.sortOrder - second.sortOrder);

  return (
    <section className="animate-content-enter bg-[#f5f5f5] px-6 py-6">
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-sm font-extrabold">{settings.title}</h2>
        <Link
          href={settings.allHref}
          className="text-primary decoration-primary hover:text-primary-container flex items-center gap-1 text-xs font-bold underline underline-offset-4 transition-colors"
        >
          Ver todos
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {activeTiles.map(({ href, imageSrc, label, sortOrder }) => (
          <Link
            key={`${sortOrder}-${label}`}
            href={href}
            className="group hover:border-primary focus-visible:outline-primary flex h-[70px] items-center gap-2 rounded-md border border-transparent bg-white p-3 transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Image
              src={imageSrc}
              alt=""
              aria-hidden="true"
              width={72}
              height={48}
              className="h-12 w-auto shrink-0 object-contain"
              style={{ width: "auto", height: "48px" }}
              sizes="72px"
            />
            <span className="min-w-0 flex-1 text-sm font-bold">{label}</span>
            <span
              className="material-symbols-outlined text-secondary group-hover:text-primary shrink-0 transition-colors"
              aria-hidden="true"
            >
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
