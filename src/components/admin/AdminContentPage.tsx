"use client";

import { useState } from "react";

import type { SiteSettings } from "@/lib/api/settings";
import type { SliderSlide } from "@/lib/api/slider";

import { AdminFooterPage } from "./AdminFooterPage";
import { AdminSliderPage } from "./AdminSliderPage";

interface Props {
  initialSlides: SliderSlide[];
  initialSettings: SiteSettings;
}

const TABS = [
  { id: "slider", label: "Slider", icon: "slideshow" },
  { id: "footer", label: "Footer", icon: "bottom_panel_open" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminContentPage({ initialSlides, initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("slider");

  return (
    <div>
      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-outline-variant/30">
        <div className="flex gap-1 px-4 pt-4 pb-0 overflow-x-auto [scrollbar-width:none]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{
                  fontVariationSettings:
                    `'FILL' ${activeTab === tab.id ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className={activeTab === "slider" ? "block" : "hidden"}>
        <AdminSliderPage initialSlides={initialSlides} />
      </div>
      <div className={activeTab === "footer" ? "block" : "hidden"}>
        <AdminFooterPage initial={initialSettings} />
      </div>
    </div>
  );
}
