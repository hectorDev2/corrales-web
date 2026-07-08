"use client";

import { useCallback, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapViewProps {
  lat?: number | null;
  lng?: number | null;
  onChange?: (lat: number, lng: number) => void;
}

export function MapView({ lat, lng, onChange }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const token =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      : undefined;

  useEffect(() => {
    if (!token || !containerRef.current) return;

    mapboxgl.accessToken = token;

    const hasLocation = lat != null && lng != null;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: hasLocation ? [lng, lat] : [-77.0428, -12.0464],
      zoom: hasLocation ? 15 : 11,
      attributionControl: false,
      dragRotate: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    if (hasLocation) {
      const marker = new mapboxgl.Marker({ color: "#e4002b" })
        .setLngLat([lng, lat])
        .addTo(map);
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

    const hasLocation = lat != null && lng != null;

    if (hasLocation) {
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: "#e4002b" })
          .setLngLat([lng, lat])
          .addTo(map);
      }
      map.flyTo({ center: [lng, lat], zoom: 15 });
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [lat, lng]);

  const handleMapClick = useCallback(
    (e: mapboxgl.MapMouseEvent) => {
      if (!onChange) return;
      onChange(e.lngLat.lat, e.lngLat.lng);
    },
    [onChange],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onChange) return;

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [onChange, handleMapClick]);

  if (!token) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-[180px] rounded-xl overflow-hidden"
    />
  );
}
