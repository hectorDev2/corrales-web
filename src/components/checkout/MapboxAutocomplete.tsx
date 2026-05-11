"use client";

import { useEffect, useRef } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

interface MapboxAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  onCoordinates?: (lat: number, lng: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MapboxAutocomplete({
  value = "",
  onChange,
  onCoordinates,
  placeholder = "Calle, número y urbanización",
  disabled = false,
}: MapboxAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const onChangeRef = useRef(onChange);
  const onCoordsRef = useRef(onCoordinates);

  onChangeRef.current = onChange;
  onCoordsRef.current = onCoordinates;

  const token =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      : undefined;

  useEffect(() => {
    if (!token || !containerRef.current) return;

    const container = containerRef.current;
    const geocoder = new MapboxGeocoder({
      accessToken: token,
      types: "address,place,locality,neighborhood,district",
      placeholder,
      language: "es",
      country: "PE",
      minLength: 3,
      clearAndBlurOnEsc: false,
      clearOnBlur: false,
    } as MapboxGeocoder.GeocoderOptions & { country: string });

    geocoder.on("result", (e) => {
      const result = e.result as MapboxGeocoder.Result;
      onChangeRef.current(result.place_name);
      if (result.center && result.center.length >= 2) {
        onCoordsRef.current?.(result.center[1], result.center[0]);
      }
    });

    geocoder.on("clear", () => {
      onChangeRef.current("");
    });

    const el = geocoder.onAdd(null as any);
    container.appendChild(el);
    geocoderRef.current = geocoder;

    if (value) {
      geocoder.setInput(value);
    }

    return () => {
      if (container.contains(el)) {
        container.removeChild(el);
      }
      geocoderRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Sync external value changes into the geocoder input
  useEffect(() => {
    if (geocoderRef.current && value) {
      geocoderRef.current.setInput(value);
    }
  }, [value]);

  if (!token) {
    return (
      <div className="relative">
        <span
          className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          location_on
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <span
        className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline z-10 pointer-events-none"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
      >
        location_on
      </span>
      <div ref={containerRef} className="mapbox-autocomplete w-full" />
    </div>
  );
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  const token =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      : undefined;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=es&country=PE&types=address,place,locality,neighborhood,district&limit=1`,
    );
    const data = await res.json();
    return data.features?.[0]?.place_name ?? null;
  } catch {
    return null;
  }
}
