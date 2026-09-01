"use client";

import { useState } from "react";

import { resolveHomeSavingsSettings, type SiteSettings } from "@/lib/api/settings";
import type { SliderSlide } from "@/lib/api/slider";

import { AdminFooterPage } from "./AdminFooterPage";
import { AdminHomeSavingsPage } from "./AdminHomeSavingsPage";
import { AdminSliderPage } from "./AdminSliderPage";

interface Props {
  initialSlides: SliderSlide[];
  initialSettings: SiteSettings;
}

const TABS = [
  { id: "slider", label: "Slider", icon: "slideshow" },
  { id: "home", label: "Inicio", icon: "home" },
  { id: "footer", label: "Footer", icon: "bottom_panel_open" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminContentPage({ initialSlides, initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("slider");

  return (
    <div>
      {/* Tabs */}
      <div className="border-outline-variant/30 sticky top-0 z-10 border-b bg-white/90 backdrop-blur-sm">
        <div className="flex [scrollbar-width:none] gap-1 overflow-x-auto px-4 pt-4 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-on-primary shadow-primary/20 shadow-lg"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{
                  fontVariationSettings: `'FILL' ${activeTab === tab.id ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
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
      <div className={activeTab === "home" ? "block" : "hidden"}>
        <AdminHomeSavingsPage
          initial={resolveHomeSavingsSettings(initialSettings.footer.homeSavings)}
          currentFooter={initialSettings.footer}
        />
      </div>
      <div className={activeTab === "footer" ? "block" : "hidden"}>
        <AdminFooterPage initial={initialSettings} />
      </div>
    </div>
  );
}
