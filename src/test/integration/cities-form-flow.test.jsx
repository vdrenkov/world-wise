import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CityList from "../../components/CityList";
import Form from "../../components/Form";
import { CitiesProvider } from "../../contexts/CitiesContext";

const STORAGE_KEY = "worldwise.cities";

function renderCitiesFlowApp(initialEntries) {
  return render(
    <CitiesProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/app/form" element={<Form />} />
          <Route path="/app/cities" element={<CityList />} />
        </Routes>
      </MemoryRouter>
    </CitiesProvider>,
  );
}

describe("cities form flow integration", () => {
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("creates a city from form data and persists it after remount", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("city-new");
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        city: "Sofia",
        countryName: "Bulgaria",
        countryCode: "BG",
      }),
    });

    const { unmount } = renderCitiesFlowApp(["/app/form?lat=42.6977&lng=23.3219"]);

    await waitFor(() => {
      expect(screen.getByLabelText("City name")).toHaveValue("Sofia");
    });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(screen.getByText("Sofia")).toBeInTheDocument();
    });

    const storedCities = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    expect(storedCities).toHaveLength(1);
    expect(storedCities[0].id).toBe("city-new");
    expect(storedCities[0].cityName).toBe("Sofia");

    unmount();

    renderCitiesFlowApp(["/app/cities"]);

    await waitFor(() => {
      expect(screen.getByText("Sofia")).toBeInTheDocument();
    });
  });
});
