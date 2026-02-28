import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CityList from "../../components/CityList";
import { CitiesProvider } from "../../contexts/CitiesContext";

function createFetchResponse(payload) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(payload),
  };
}

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

describe("cities delete integration", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deletes a city from the list via the UI", async () => {
    fetchMock.mockImplementation((url, options) => {
      if (url === "http://localhost:8800/cities" && !options) {
        return Promise.resolve(
          createFetchResponse([
            {
              id: 1,
              cityName: "Sofia",
              country: "Bulgaria",
              emoji: "🇧🇬",
              date: "2026-02-01T00:00:00.000Z",
              position: { lat: 42.6977, lng: 23.3219 },
            },
            {
              id: 2,
              cityName: "Berlin",
              country: "Germany",
              emoji: "🇩🇪",
              date: "2026-02-02T00:00:00.000Z",
              position: { lat: 52.52, lng: 13.405 },
            },
          ]),
        );
      }

      if (url === "http://localhost:8800/cities/1" && options?.method === "DELETE") {
        return Promise.resolve(createFetchResponse({}));
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`));
    });

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
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8800/cities/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
