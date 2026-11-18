import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLocationStore } from "@/store/location";

const { mockRequestLocation, mockReverseGeocode } = vi.hoisted(() => ({
  mockRequestLocation: vi.fn(),
  mockReverseGeocode: vi.fn(),
}));

vi.mock("@/hooks/useGeolocation", () => ({
  useGeolocation: () => ({
    getStored: () => null,
    requestLocation: mockRequestLocation,
    isDismissed: () => false,
    dismiss: vi.fn(),
  }),
}));

vi.mock("@/components/checkout/MapboxAutocomplete", () => ({
  reverseGeocode: mockReverseGeocode,
}));

import { LocationBanner } from "./LocationBanner";

describe("LocationBanner", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {},
    });
    mockRequestLocation.mockResolvedValue({ lat: -13.523, lng: -71.967, timestamp: Date.now() });
    mockReverseGeocode.mockResolvedValue("Av. El Sol, Cusco");
    useLocationStore.setState({ address: "", lat: null, lng: null, modalOpen: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    Reflect.deleteProperty(navigator, "geolocation");
  });

  it("guarda la dirección resuelta en el store al compartir la ubicación", async () => {
    render(<LocationBanner />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /sí, compartir/i }));
    });

    expect(useLocationStore.getState()).toMatchObject({
      address: "Av. El Sol, Cusco",
      lat: -13.523,
      lng: -71.967,
    });
  });
});
