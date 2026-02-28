import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CitiesProvider, useCities } from "../../../contexts/CitiesContext";

const STORAGE_KEY = "worldwise.cities";

const storedCities = [
  {
    id: "city-sofia",
    cityName: "Sofia",
    country: "Bulgaria",
    emoji: "🇧🇬",
    date: "2026-01-10T00:00:00.000Z",
    notes: "Great trip",
    position: { lat: "42.6977", lng: "23.3219" },
  },
  {
    id: "city-berlin",
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

      <button onClick={() => getCity("city-sofia")}>Load Sofia</button>
      <button onClick={() => getCity("999")}>Load missing city</button>
      <button onClick={handleCreate}>Create city</button>
      <button onClick={() => deleteCity("city-sofia")}>Delete Sofia</button>
      <button onClick={() => deleteCity("city-berlin")}>Delete Berlin</button>
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
      expect(screen.getByTestId("cities")).toHaveTextContent(
        "city-sofia,city-berlin",
      );
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
      expect(screen.getByTestId("cities")).toHaveTextContent(
        "city-sofia,city-berlin",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Load Sofia" }));

    await waitFor(() => {
      expect(screen.getByTestId("current-city")).toHaveTextContent("city-sofia");
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
      expect(screen.getByTestId("cities")).toHaveTextContent(
        "city-sofia,city-berlin",
      );
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
      expect(screen.getByTestId("cities")).toHaveTextContent("city-sofia");
    });

    fireEvent.click(screen.getByRole("button", { name: "Create city" }));

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent(
        "city-sofia,city-3",
      );
    });
    expect(screen.getByTestId("current-city")).toHaveTextContent("city-3");
    expect(screen.getByTestId("create-result")).toHaveTextContent("true");
    expect(readStoredCities().map((city) => city.id)).toEqual([
      "city-sofia",
      "city-3",
    ]);
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
      expect(screen.getByTestId("cities")).toHaveTextContent(
        "city-sofia,city-berlin",
      );
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
      expect(screen.getByTestId("cities")).toHaveTextContent(
        "city-sofia,city-berlin",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Load Sofia" }));
    await waitFor(() => {
      expect(screen.getByTestId("current-city")).toHaveTextContent("city-sofia");
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete Sofia" }));

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("city-berlin");
    });
    expect(screen.getByTestId("current-city")).toHaveTextContent("none");
    expect(readStoredCities().map((city) => city.id)).toEqual(["city-berlin"]);
  });

  it("keeps current city when deleting a different city", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCities));

    render(
      <CitiesProvider>
        <CitiesHarness />
      </CitiesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent(
        "city-sofia,city-berlin",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Load Sofia" }));
    await waitFor(() => {
      expect(screen.getByTestId("current-city")).toHaveTextContent("city-sofia");
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete Berlin" }));

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("city-sofia");
    });
    expect(screen.getByTestId("current-city")).toHaveTextContent("city-sofia");
  });
});
