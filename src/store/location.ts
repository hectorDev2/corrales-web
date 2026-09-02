import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DeliveryType = "delivery" | "pickup";

export interface LocationState {
  address: string;
  lat: number | null;
  lng: number | null;
  deliveryType: DeliveryType;
  modalOpen: boolean;
  setAddress: (address: string, lat?: number, lng?: number) => void;
  setDeliveryType: (type: DeliveryType) => void;
  openModal: () => void;
  closeModal: () => void;
}

function hasSavedLocation(
  state: Partial<LocationState>,
): state is Pick<LocationState, "address" | "lat" | "lng"> {
  return (
    typeof state.address === "string" &&
    state.address.trim().length > 0 &&
    typeof state.lat === "number" &&
    Number.isFinite(state.lat) &&
    typeof state.lng === "number" &&
    Number.isFinite(state.lng)
  );
}

/**
 * Zustand puede rehidratar instalaciones anteriores que guardaron una ubicación vacía.
 * El store no inventa una dirección: el mapa resuelve la vista general de Cusco sin marker.
 */
export function mergePersistedLocationState(
  persistedState: unknown,
  currentState: LocationState,
): LocationState {
  const persisted =
    persistedState && typeof persistedState === "object"
      ? (persistedState as Partial<LocationState>)
      : {};

  const deliveryType: DeliveryType =
    persisted.deliveryType === "pickup" || persisted.deliveryType === "delivery"
      ? persisted.deliveryType
      : currentState.deliveryType;

  if (!hasSavedLocation(persisted)) {
    return {
      ...currentState,
      address: typeof persisted.address === "string" ? persisted.address : currentState.address,
      deliveryType,
    };
  }

  return {
    ...currentState,
    address: persisted.address,
    lat: persisted.lat,
    lng: persisted.lng,
    deliveryType,
  };
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      address: "",
      lat: null,
      lng: null,
      deliveryType: "delivery",
      modalOpen: false,

      setAddress: (address, lat, lng) => set({ address, lat: lat ?? null, lng: lng ?? null }),

      setDeliveryType: (deliveryType) => set({ deliveryType }),

      openModal: () => set({ modalOpen: true }),
      closeModal: () => set({ modalOpen: false }),
    }),
    {
      name: "corrales-location",
      merge: mergePersistedLocationState,
      partialize: (state) => ({
        address: state.address,
        lat: state.lat,
        lng: state.lng,
        deliveryType: state.deliveryType,
      }),
    },
  ),
);
