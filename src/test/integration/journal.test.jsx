import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Map as LeafletMap } from "leaflet";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "../../App";
import { STORAGE_KEY } from "../../services/cityStorage";
import { berlin, sofia } from "../fixtures";

class ResizeObserverStub {
  observe() {}
  disconnect() {}
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

async function enterJournal(cities = []) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
  window.history.replaceState({}, "", "/login");
  render(<App />);
  fireEvent.click(
    await screen.findByRole("button", { name: "Login", exact: true }),
  );
  await screen.findByRole("link", { name: "+ Add a place" });
}

describe("Complete journal", () => {
  it("synchronizeJournal_otherTabAddsTrip_keepsOpenTripVisible", async () => {
    await enterJournal([sofia]);
    expect(document.querySelectorAll(".leaflet-marker-icon")).toHaveLength(1);
    fireEvent.click(await screen.findByRole("link", { name: /Sofia/ }));
    await screen.findByText(sofia.notes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([sofia, berlin]));
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          storageArea: localStorage,
        }),
      ),
    );

    expect(screen.getByText(sofia.notes)).toBeInTheDocument();
    expect(document.querySelectorAll(".leaflet-marker-icon")).toHaveLength(2);
    expect(
      screen.queryByRole("heading", { name: "Trip not found" }),
    ).not.toBeInTheDocument();
  });

  it("browseJournal_savedTrips_opensDetailsAndUniqueCountries", async () => {
    await enterJournal([sofia, berlin]);
    fireEvent.click(await screen.findByRole("link", { name: /Sofia/ }));
    await screen.findByRole("heading", { name: /Sofia/, level: 1 });
    expect(screen.getByText(sofia.notes)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("link", { name: "Countries", exact: true }),
    );
    expect(await screen.findByText("Bulgaria")).toBeInTheDocument();
    expect(screen.getByText("Germany")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(
      await screen.findByRole("heading", { name: /Go places/ }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(2);
  });

  it("createTrip_keyboardCoordinates_savesAndNavigates", async () => {
    await enterJournal();
    fireEvent.click(screen.getByRole("link", { name: "+ Add a place" }));
    fireEvent.change(await screen.findByLabelText("Latitude"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("Longitude"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("City name"), {
      target: { value: "Null Island" },
    });
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "Atlantic Ocean" },
    });
    fireEvent.change(screen.getByLabelText(/Trip notes/), {
      target: { value: "A point at the equator." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add", exact: true }));
    expect(
      await screen.findByRole("link", { name: /Null Island/ }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0]).toMatchObject({
      position: { lat: 0, lng: 0 },
      notes: "A point at the equator.",
    });
  });

  it("createTrip_storageDenied_keepsFormAndExistingJournal", async () => {
    await enterJournal([sofia]);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
    fireEvent.click(screen.getByRole("link", { name: "+ Add a place" }));
    fireEvent.change(await screen.findByLabelText("Latitude"), {
      target: { value: "40" },
    });
    fireEvent.change(screen.getByLabelText("Longitude"), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByLabelText("City name"), {
      target: { value: "Rome" },
    });
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "Italy" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add", exact: true }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not be saved",
    );
    expect(screen.getByLabelText("City name")).toHaveValue("Rome");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([sofia]);
  });

  it("deleteTrip_storageDenied_keepsExistingTrip", async () => {
    await enterJournal([sofia]);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete Sofia" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not be deleted",
    );
    expect(screen.getByRole("link", { name: /Sofia/ })).toBeInTheDocument();
  });

  it("loadJournal_corruptStorage_requiresExplicitReset", async () => {
    await enterJournal();
    localStorage.setItem(STORAGE_KEY, "broken");
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          storageArea: localStorage,
        }),
      ),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "original data has not been changed",
    );
    vi.spyOn(window, "confirm").mockReturnValue(false);
    fireEvent.click(
      screen.getByRole("button", { name: "Reset local journal" }),
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBe("broken");
    vi.mocked(window.confirm).mockReturnValue(true);
    fireEvent.click(
      screen.getByRole("button", { name: "Reset local journal" }),
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("nameCurrentLocation_validGps_suggestsNameAndSavesZeroLatitude", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success) =>
          success({ coords: { latitude: 0, longitude: 10 } }),
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          city: "Equator",
          countryName: "Gabon",
          countryCode: "GA",
        }),
      }),
    );
    await enterJournal();
    fireEvent.click(screen.getByRole("link", { name: "+ Add a place" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Use current location" }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("City name")).toHaveValue("Equator"),
    );
    expect(screen.getByLabelText("Country")).toHaveValue("Gabon");
    fireEvent.click(screen.getByRole("button", { name: "Add", exact: true }));
    await screen.findByRole("link", { name: /Equator/ });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0]).toMatchObject({
      emoji: "🇬🇦",
      position: { lat: 0, lng: 10 },
    });
  });

  it("nameCurrentLocation_providerFails_offersManualEntryAtGpsPoint", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success) =>
          success({ coords: { latitude: 0, longitude: 10 } }),
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await enterJournal();
    fireEvent.click(screen.getByRole("link", { name: "+ Add a place" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Use current location" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter the city and country manually",
    );
    expect(await screen.findByText("0.0000, 10.0000")).toBeInTheDocument();
  });

  it("openPublicPages_navigation_rendersProductAndPricing", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("link", { name: "The journal" }));
    expect(
      await screen.findByRole("heading", {
        name: "A small home for big adventures.",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Pricing" }));
    expect(
      await screen.findByRole("heading", { name: "Free to explore." }),
    ).toBeInTheDocument();
  });

  it("recenterMap_draftTrip_preservesInputAndSelectedCoordinates", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success) =>
          success({ coords: { latitude: 42.6977, longitude: 23.3219 } }),
      },
    });
    const setView = vi.spyOn(LeafletMap.prototype, "setView");
    await enterJournal([sofia]);
    fireEvent.click(screen.getByRole("link", { name: "+ Add a place" }));
    fireEvent.change(await screen.findByLabelText("Latitude"), {
      target: { value: "52.52" },
    });
    fireEvent.change(screen.getByLabelText("Longitude"), {
      target: { value: "13.405" },
    });
    fireEvent.change(screen.getByLabelText("City name"), {
      target: { value: "Berlin" },
    });
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "Germany" },
    });
    fireEvent.change(screen.getByLabelText(/Trip notes/), {
      target: { value: "Keep this memory." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Use your position" }));

    await waitFor(() =>
      expect(setView).toHaveBeenLastCalledWith([42.6977, 23.3219]),
    );
    expect(screen.getByLabelText("Latitude")).toHaveValue(52.52);
    expect(screen.getByLabelText("Longitude")).toHaveValue(13.405);
    expect(screen.getByLabelText("City name")).toHaveValue("Berlin");
    expect(screen.getByLabelText(/Trip notes/)).toHaveValue(
      "Keep this memory.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Add", exact: true }));

    await screen.findByRole("link", { name: /Berlin/ });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[1]).toMatchObject({
      position: { lat: 52.52, lng: 13.405 },
      notes: "Keep this memory.",
    });
  });

  it("selectMapPoint_mapClick_opensManualEntryWithoutGeocoding", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await enterJournal();
    fireEvent.click(document.querySelector(".leaflet-container"), {
      clientX: 100,
      clientY: 100,
    });

    await screen.findByRole("heading", { name: "Add a place" });
    expect(screen.getByLabelText("City name")).toHaveValue("");
    expect(screen.getByLabelText("Country")).toHaveValue("");
    expect(screen.queryByLabelText("Latitude")).not.toBeInTheDocument();
    const parameters = new URLSearchParams(window.location.search);
    const position = {
      lat: Number(parameters.get("lat")),
      lng: Number(parameters.get("lng")),
    };
    expect(parameters.has("lat")).toBe(true);
    expect(parameters.has("lng")).toBe(true);
    expect(position.lat).toBeGreaterThanOrEqual(-90);
    expect(position.lat).toBeLessThanOrEqual(90);
    expect(position.lng).toBeGreaterThanOrEqual(-180);
    expect(position.lng).toBeLessThanOrEqual(180);
    fireEvent.change(screen.getByLabelText("City name"), {
      target: { value: "Map memory" },
    });
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "My travels" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add", exact: true }));

    await screen.findByRole("link", { name: /Map memory/ });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))[0].position).toEqual(
      position,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("loadMap_tilesFail_keepsCoordinateEntryAvailableAndRecovers", async () => {
    await enterJournal();
    const tile = document.querySelector(".leaflet-tile");
    expect(tile).not.toBeNull();
    fireEvent.error(tile);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Map tiles are unavailable",
    );
    const manualEntry = screen.getByRole("link", {
      name: "Add a place using coordinates.",
    });
    expect(manualEntry).toHaveAttribute("href", "/app/form");
    fireEvent.click(manualEntry);
    expect(await screen.findByLabelText("Latitude")).toBeInTheDocument();
    fireEvent.load(tile);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
