import { describe, expect, it } from "vitest";

import { CUSCO_CITY_VIEW, resolveMapView } from "./MapView";

describe("MapView defaults", () => {
  it("shows the city of Cusco without a marker until a location is selected", () => {
    expect(resolveMapView(null, null)).toEqual({
      center: [CUSCO_CITY_VIEW.lng, CUSCO_CITY_VIEW.lat],
      zoom: CUSCO_CITY_VIEW.zoom,
      hasLocation: false,
    });
  });

  it("shows a precise location and marker after the user selects coordinates", () => {
    expect(resolveMapView(-13.5226, -71.9673)).toEqual({
      center: [-71.9673, -13.5226],
      zoom: 15,
      hasLocation: true,
    });
  });
});
