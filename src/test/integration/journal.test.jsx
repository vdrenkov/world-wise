import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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

  it("openPublicPages_navigation_rendersAccurateProductAndDemoCopy", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("link", { name: "The journal" }));
    expect(
      await screen.findByRole("heading", {
        name: "A small home for big adventures.",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Free demo" }));
    expect(
      await screen.findByRole("heading", { name: "Free to explore." }),
    ).toBeInTheDocument();
  });
});
