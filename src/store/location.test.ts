import { describe, expect, it } from "vitest";

import { mergePersistedLocationState, type LocationState } from "./location";

const currentState = {
  address: "",
  lat: null,
  lng: null,
  deliveryType: "delivery" as const,
  modalOpen: false,
  setAddress: () => undefined,
  setDeliveryType: () => undefined,
  openModal: () => undefined,
  closeModal: () => undefined,
} satisfies LocationState;

describe("location store defaults", () => {
  it("keeps an empty state when the persisted data has no selected location", () => {
    const resolved = mergePersistedLocationState(
      { address: "", lat: null, lng: null, deliveryType: "delivery" },
      currentState,
    );

    expect(resolved).toMatchObject({ address: "", lat: null, lng: null });
  });

  it("keeps the user's saved address and coordinates", () => {
    const savedLocation = {
      address: "Av. El Sol 123, Cusco, Perú",
      lat: -13.5226,
      lng: -71.9673,
      deliveryType: "pickup",
    };

    const resolved = mergePersistedLocationState(savedLocation, currentState);

    expect(resolved).toMatchObject(savedLocation);
  });
});
