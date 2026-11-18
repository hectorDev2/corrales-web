"use client";

import { useLayoutEffect } from "react";

const MOBILE_HEADER_HEIGHT_VARIABLE = "--public-mobile-header-height";

/** Keeps the mobile SubHeader sticky offset in sync with the rendered Header. */
export function PublicHeaderHeightSync() {
  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-public-header]");
    if (!header) return;

    const syncHeight = () => {
      document.documentElement.style.setProperty(
        MOBILE_HEADER_HEIGHT_VARIABLE,
        `${header.getBoundingClientRect().height}px`,
      );
    };

    syncHeight();

    const observer =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(syncHeight);
    observer?.observe(header);
    window.addEventListener("resize", syncHeight);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncHeight);
      document.documentElement.style.removeProperty(MOBILE_HEADER_HEIGHT_VARIABLE);
    };
  }, []);

  return null;
}
