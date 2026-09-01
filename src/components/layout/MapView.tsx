"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapViewProps {
  lat?: number | null;
  lng?: number | null;
  onChange?: (lat: number, lng: number) => void;
}

/** Vista amplia para orientar al usuario antes de que elija una dirección. */
export const CUSCO_CITY_VIEW = {
  lat: -13.53195,
  lng: -71.96746,
  zoom: 12,
} as const;

export function resolveMapView(lat?: number | null, lng?: number | null) {
  const hasLocation =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng);

  return hasLocation
    ? { center: [lng, lat] as [number, number], zoom: 15, hasLocation }
    : {
        center: [CUSCO_CITY_VIEW.lng, CUSCO_CITY_VIEW.lat] as [number, number],
        zoom: CUSCO_CITY_VIEW.zoom,
        hasLocation,
      };
}

export function MapView({ lat, lng, onChange }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const locationRef = useRef({ lat, lng });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    locationRef.current = { lat, lng };
  }, [lat, lng]);

  const token = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN : undefined;

  useEffect(() => {
    if (!token || !containerRef.current) return;

    mapboxgl.accessToken = token;

    const { center, zoom, hasLocation } = resolveMapView(
      locationRef.current.lat,
      locationRef.current.lng,
    );

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom,
      attributionControl: false,
      dragRotate: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    if (hasLocation) {
      const el = document.createElement("div");
      el.innerHTML = `<svg display="block" height="41px" width="27px" viewBox="0 0 27 41" style="pointer-events:none"><path fill="#e4002b" d="M27,13.5C27,19.07 20.25,27 14.75,34.5C14.02,35.5 12.98,35.5 12.25,34.5C6.75,27 0,19.22 0,13.5C0,6.04 6.04,0 13.5,0C20.96,0 27,6.04 27,13.5Z"/><path opacity="0.25" d="M13.5,0C6.04,0 0,6.04 0,13.5C0,19.22 6.75,27 12.25,34.5C13,35.52 14.02,35.5 14.75,34.5C20.25,27 27,19.07 27,13.5C27,6.04 20.96,0 13.5,0ZM13.5,1C20.42,1 26,6.58 26,13.5C26,15.9 24.5,19.18 22.22,22.74C19.95,26.3 16.71,30.14 13.94,33.91C13.74,34.18 13.61,34.32 13.5,34.44C13.39,34.32 13.26,34.18 13.06,33.91C10.28,30.13 7.41,26.31 5.02,22.77C2.62,19.23 1,15.95 1,13.5C1,6.58 6.58,1 13.5,1Z"/><circle fill="white" cx="13.5" cy="13.5" r="5.5"/></svg>`;

      const marker = new mapboxgl.Marker({ element: el }).setLngLat(center).addTo(map);
      markerRef.current = marker;
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const { center, hasLocation } = resolveMapView(lat, lng);

    if (hasLocation) {
      if (markerRef.current) {
        markerRef.current.setLngLat(center);
      } else {
        const el = document.createElement("div");
        el.innerHTML = `<svg display="block" height="41px" width="27px" viewBox="0 0 27 41" style="pointer-events:none"><path fill="#e4002b" d="M27,13.5C27,19.07 20.25,27 14.75,34.5C14.02,35.5 12.98,35.5 12.25,34.5C6.75,27 0,19.22 0,13.5C0,6.04 6.04,0 13.5,0C20.96,0 27,6.04 27,13.5Z"/><path opacity="0.25" d="M13.5,0C6.04,0 0,6.04 0,13.5C0,19.22 6.75,27 12.25,34.5C13,35.52 14.02,35.5 14.75,34.5C20.25,27 27,19.07 27,13.5C27,6.04 20.96,0 13.5,0ZM13.5,1C20.42,1 26,6.58 26,13.5C26,15.9 24.5,19.18 22.22,22.74C19.95,26.3 16.71,30.14 13.94,33.91C13.74,34.18 13.61,34.32 13.5,34.44C13.39,34.32 13.26,34.18 13.06,33.91C10.28,30.13 7.41,26.31 5.02,22.77C2.62,19.23 1,15.95 1,13.5C1,6.58 6.58,1 13.5,1Z"/><circle fill="white" cx="13.5" cy="13.5" r="5.5"/></svg>`;
        markerRef.current = new mapboxgl.Marker({ element: el }).setLngLat(center).addTo(map);
      }
      map.flyTo({ center, zoom: 15 });
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
      map.flyTo({ center, zoom: CUSCO_CITY_VIEW.zoom });
    } else {
      map.flyTo({ center, zoom: CUSCO_CITY_VIEW.zoom });
    }
  }, [lat, lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onChangeRef.current) return;

    const handler = (e: mapboxgl.MapMouseEvent) => {
      onChangeRef.current?.(e.lngLat.lat, e.lngLat.lng);
    };
    map.on("click", handler);

    return () => {
      map.off("click", handler);
    };
  }, []);

  if (!token) return null;

  return <div ref={containerRef} className="h-[180px] w-full overflow-hidden rounded-xl" />;
}
