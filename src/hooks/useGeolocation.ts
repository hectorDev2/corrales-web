"use client";

import { useCallback } from "react";

export interface StoredLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

const STORAGE_KEY = "corrales_location";
const DISMISSED_KEY = "corrales_location_dismissed";
const TTL_MS = 60 * 60 * 1000; // 1 hora

export function useGeolocation() {
  const getStored = useCallback((): StoredLocation | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: StoredLocation = JSON.parse(raw);
      if (Date.now() - parsed.timestamp > TTL_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, []);

  const requestLocation = useCallback((): Promise<StoredLocation | null> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: StoredLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: Date.now(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
          resolve(loc);
        },
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: true },
      );
    });
  }, []);

  const isDismissed = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISMISSED_KEY) === "1";
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "1");
  }, []);

  const toMapsUrl = useCallback((loc: StoredLocation): string => {
    return `https://maps.google.com/?q=${loc.lat},${loc.lng}`;
  }, []);

  return { getStored, requestLocation, isDismissed, dismiss, toMapsUrl };
}
