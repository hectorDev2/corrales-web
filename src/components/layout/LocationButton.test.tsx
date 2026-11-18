import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useLocationStore } from "@/store/location";

import { LocationButton } from "./LocationButton";

describe("LocationButton", () => {
  beforeEach(() => {
    useLocationStore.setState({ address: "", lat: null, lng: null, modalOpen: false });
  });

  it("muestra reactivamente la dirección guardada y conserva el selector al hacer click", () => {
    render(<LocationButton />);

    expect(screen.getByText("Ingresa tu ubicación")).toBeInTheDocument();

    act(() => {
      useLocationStore.getState().setAddress("Av. El Sol, Cusco", -13.523, -71.967);
    });

    expect(screen.getByText("Av. El Sol, Cusco")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(useLocationStore.getState().modalOpen).toBe(true);
  });
});
