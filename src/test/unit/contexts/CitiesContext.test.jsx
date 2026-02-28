import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CitiesProvider, useCities } from "../../../contexts/CitiesContext";

const initialCities = [
  {
    id: 1,
    cityName: "Sofia",
    country: "Bulgaria",
    emoji: "🇧🇬",
    date: "2026-01-10T00:00:00.000Z",
    notes: "Great trip",
    position: { lat: 42.6977, lng: 23.3219 },
  },
  {
    id: 2,
    cityName: "Berlin",
    country: "Germany",
    emoji: "🇩🇪",
    date: "2026-01-15T00:00:00.000Z",
    notes: "Cold but nice",
    position: { lat: 52.52, lng: 13.405 },
  },
];

const cityToCreate = {
  cityName: "Madrid",
  country: "Spain",
  emoji: "🇪🇸",
  date: "2026-01-20T00:00:00.000Z",
  notes: "Sunny city",
  position: { lat: 40.4168, lng: -3.7038 },
};

function createFetchResponse(payload) {
  return {
    json: vi.fn().mockResolvedValue(payload),
  };
}

function CitiesHarness() {
  const { cities, currentCity, error, getCity, createCity, deleteCity } = useCities();

  return (
    <div>
      <p data-testid="cities">{cities.map((city) => city.id).join(",") || "none"}</p>
      <p data-testid="current-city">{currentCity.id ?? "none"}</p>
      <p data-testid="error">{error || "none"}</p>

      <button onClick={() => getCity("1")}>Load city 1</button>
      <button onClick={() => createCity(cityToCreate)}>Create city</button>
      <button onClick={() => deleteCity(1)}>Delete city 1</button>
    </div>
  );
}

describe("CitiesContext", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads cities on mount", async () => {
    fetchMock.mockResolvedValueOnce(createFetchResponse(initialCities));

    render(
      <CitiesProvider>
        <CitiesHarness />
      </CitiesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("cities")).toHaveTextContent("1,2");
    });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8800/cities");
  });

  it("sets an error when the initial city request fails", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network down"));

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

  it("fetches a city once and skips duplicate requests for the current city", async () => {
    fetchMock
      .mockResolvedValueOnce(createFetchResponse(initialCities))
      .mockResolvedValueOnce(createFetchResponse(initialCities[0]));

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
    expect(fetchMock).toHaveBeenNthCalledWith(2, "http://localhost:8800/cities/1");

    fireEvent.click(screen.getByRole("button", { name: "Load city 1" }));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("creates a city via POST and updates current city", async () => {
    fetchMock
      .mockResolvedValueOnce(createFetchResponse([initialCities[0]]))
      .mockResolvedValueOnce(createFetchResponse({ id: 3, ...cityToCreate }));

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
      expect(screen.getByTestId("cities")).toHaveTextContent("1,3");
    });
    expect(screen.getByTestId("current-city")).toHaveTextContent("3");
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8800/cities",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cityToCreate),
      }),
    );
  });

  it("deletes a city and clears the current city", async () => {
    fetchMock
      .mockResolvedValueOnce(createFetchResponse(initialCities))
      .mockResolvedValueOnce(createFetchResponse(initialCities[0]))
      .mockResolvedValueOnce(createFetchResponse({}));

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
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8800/cities/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
