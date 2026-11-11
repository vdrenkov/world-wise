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

describe("Trip persistence", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("createCity_manualForm_persistsTripAfterRemount", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("city-new");
    const { unmount } = renderCitiesFlowApp([
      "/app/form?lat=42.6977&lng=23.3219",
    ]);
    fireEvent.change(screen.getByLabelText("City name"), {
      target: { value: "Sofia" },
    });
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "Bulgaria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add", exact: true }));

    await screen.findByText("Sofia");
    const storedCities = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(storedCities).toHaveLength(1);
    expect(storedCities[0]).toMatchObject({
      id: "city-new",
      cityName: "Sofia",
      position: { lat: 42.6977, lng: 23.3219 },
    });
    unmount();
    renderCitiesFlowApp(["/app/cities"]);
    await waitFor(() => expect(screen.getByText("Sofia")).toBeInTheDocument());
  });
});
