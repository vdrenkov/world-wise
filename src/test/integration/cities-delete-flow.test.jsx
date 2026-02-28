import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import CityList from "../../components/CityList";
import { CitiesProvider } from "../../contexts/CitiesContext";

const STORAGE_KEY = "worldwise.cities";

const seededCities = [
  {
    id: "city-sofia",
    cityName: "Sofia",
    country: "Bulgaria",
    emoji: "🇧🇬",
    date: "2026-02-01T00:00:00.000Z",
    position: { lat: "42.6977", lng: "23.3219" },
  },
  {
    id: "city-berlin",
    cityName: "Berlin",
    country: "Germany",
    emoji: "🇩🇪",
    date: "2026-02-02T00:00:00.000Z",
    position: { lat: "52.52", lng: "13.405" },
  },
];

function renderCityListApp(initialEntries) {
  return render(
    <CitiesProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/app/cities" element={<CityList />} />
          <Route path="/app/cities/:id" element={<p>City details</p>} />
        </Routes>
      </MemoryRouter>
    </CitiesProvider>,
  );
}

describe("cities delete flow integration", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seededCities));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("deletes a city from UI and updates localStorage", async () => {
    renderCityListApp(["/app/cities"]);

    await waitFor(() => {
      expect(screen.getByText("Sofia")).toBeInTheDocument();
      expect(screen.getByText("Berlin")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete Sofia" }));

    await waitFor(() => {
      expect(screen.queryByText("Sofia")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Berlin")).toBeInTheDocument();

    const storedCities = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    expect(storedCities).toHaveLength(1);
    expect(storedCities[0].id).toBe("city-berlin");
  });
});
