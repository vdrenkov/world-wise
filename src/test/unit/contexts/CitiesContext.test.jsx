import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CitiesProvider, useCities } from "../../../contexts/CitiesContext";

const STORAGE_KEY = "worldwise.cities";

const storedCities = [
  {
    id: "1",
    cityName: "Sofia",
    country: "Bulgaria",
    emoji: "🇧🇬",
    date: "2026-01-10T00:00:00.000Z",
    notes: "Great trip",
    position: { lat: "42.6977", lng: "23.3219" },
  },
  {
    id: "2",
    cityName: "Berlin",
    country: "Germany",
    emoji: "🇩🇪",
    date: "2026-01-15T00:00:00.000Z",
    notes: "Cold but nice",
    position: { lat: "52.52", lng: "13.405" },
  },
];

const cityToCreate = {
  cityName: "Madrid",
  country: "Spain",
  emoji: "🇪🇸",
  date: "2026-01-20T00:00:00.000Z",
  notes: "Sunny city",
  position: { lat: "40.4168", lng: "-3.7038" },
};

function readStoredCities() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function CitiesHarness() {
  const { cities, currentCity, error, getCity, createCity, deleteCity } = useCities();
  const [createResult, setCreateResult] = useState("none");

  async function handleCreate() {
    const result = await createCity(cityToCreate);
    setCreateResult(String(result));
  }

  return (
    <div>
      <p data-testid="cities">{cities.map((city) => city.id).join(",") || "none"}</p>
      <p data-testid="current-city">{currentCity.id ?? "none"}</p>
      <p data-testid="error">{error || "none"}</p>
      <p data-testid="create-result">{createResult}</p>

      <button onClick={() => getCity("1")}>Load city 1</button>
      <button onClick={() => getCity("999")}>Load missing city</button>
      <button onClick={handleCreate}>Create city</button>
      <button onClick={() => deleteCity("1")}>Delete city 1</button>
      <button onClick={() => deleteCity("2")}>Delete city 2</button>
    </div>
  );
}

describe("CitiesContext with localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("loads cities from localStorage on mount", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCities));

    render(
      <CitiesProvider>
        <CitiesHarness />
      </CitiesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("1,2");
    });
  });

  it("sets an error when localStorage contains invalid JSON", async () => {
    localStorage.setItem(STORAGE_KEY, "{invalid-json");

    render(
      <CitiesProvider>
        <CitiesHarness />
      </CitiesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "There was an error loading the cities...",
      );
    });
  });

  it("loads city details by id", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCities));

    render(
      <CitiesProvider>
        <CitiesHarness />
      </CitiesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("1,2");
    });

    fireEvent.click(screen.getByRole("button", { name: "Load city 1" }));

    await waitFor(() => {
      expect(screen.getByTestId("current-city")).toHaveTextContent("1");
    });
  });

  it("sets an error when loading a missing city", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCities));

    render(
      <CitiesProvider>
        <CitiesHarness />
      </CitiesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("1,2");
    });

    fireEvent.click(screen.getByRole("button", { name: "Load missing city" }));

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "There was an error loading the city...",
      );
    });
  });

  it("creates a city, persists it, and returns success", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([storedCities[0]]));
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("city-3");

    render(
      <CitiesProvider>
        <CitiesHarness />
      </CitiesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("1");
    });

    fireEvent.click(screen.getByRole("button", { name: "Create city" }));

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("1,city-3");
    });
    expect(screen.getByTestId("current-city")).toHaveTextContent("city-3");
    expect(screen.getByTestId("create-result")).toHaveTextContent("true");
    expect(readStoredCities().map((city) => city.id)).toEqual(["1", "city-3"]);
  });

  it("returns failure and sets an error if city creation cannot be saved", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCities));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage write denied");
    });

    render(
      <CitiesProvider>
        <CitiesHarness />
      </CitiesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("1,2");
    });

    fireEvent.click(screen.getByRole("button", { name: "Create city" }));

    await waitFor(() => {
      expect(screen.getByTestId("create-result")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("error")).toHaveTextContent(
      "There was an error creating the city...",
    );
  });

  it("deletes a city and clears current city when deleting the selected city", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCities));

    render(
      <CitiesProvider>
        <CitiesHarness />
      </CitiesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("1,2");
    });

    fireEvent.click(screen.getByRole("button", { name: "Load city 1" }));
    await waitFor(() => {
      expect(screen.getByTestId("current-city")).toHaveTextContent("1");
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete city 1" }));

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("2");
    });
    expect(screen.getByTestId("current-city")).toHaveTextContent("none");
    expect(readStoredCities().map((city) => city.id)).toEqual(["2"]);
  });

  it("keeps current city when deleting a different city", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCities));

    render(
      <CitiesProvider>
        <CitiesHarness />
      </CitiesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("1,2");
    });

    fireEvent.click(screen.getByRole("button", { name: "Load city 1" }));
    await waitFor(() => {
      expect(screen.getByTestId("current-city")).toHaveTextContent("1");
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete city 2" }));

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("1");
    });
    expect(screen.getByTestId("current-city")).toHaveTextContent("1");
  });
});
