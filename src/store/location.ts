import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DeliveryType = "delivery" | "pickup";

interface LocationState {
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

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      address: "",
      lat: null,
      lng: null,
      deliveryType: "delivery",
      modalOpen: false,

      setAddress: (address, lat, lng) =>
        set({ address, lat: lat ?? null, lng: lng ?? null }),

      setDeliveryType: (deliveryType) => set({ deliveryType }),

      openModal: () => set({ modalOpen: true }),
      closeModal: () => set({ modalOpen: false }),
    }),
    {
      name: "corrales-location",
      partialize: (state) => ({
        address: state.address,
        lat: state.lat,
        lng: state.lng,
        deliveryType: state.deliveryType,
      }),
    },
  ),
);
