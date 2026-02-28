import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CityList from "../../components/CityList";
import Form from "../../components/Form";
import { CitiesProvider } from "../../contexts/CitiesContext";

function createFetchResponse(payload) {
  return {
    json: vi.fn().mockResolvedValue(payload),
  };
}

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

describe("cities form to list integration", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates a city from the form and shows it in the city list", async () => {
    fetchMock.mockImplementation((url, options) => {
      if (url === "http://localhost:8800/cities" && !options) {
        return Promise.resolve(createFetchResponse([]));
      }

      if (
        typeof url === "string" &&
        url.startsWith(
          "https://api.bigdatacloud.net/data/reverse-geocode-client",
        )
      ) {
        return Promise.resolve(
          createFetchResponse({
            city: "Sofia",
            countryName: "Bulgaria",
            countryCode: "BG",
          }),
        );
      }

      if (
        url === "http://localhost:8800/cities" &&
        options?.method === "POST"
      ) {
        return Promise.resolve(
          createFetchResponse({
            id: 1,
            cityName: "Sofia",
            country: "Bulgaria",
            emoji: "🇧🇬",
            date: "2026-02-20T00:00:00.000Z",
            notes: "",
            position: { lat: "42.6977", lng: "23.3219" },
          }),
        );
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`));
    });

    renderCitiesFlowApp(["/app/form?lat=42.6977&lng=23.3219"]);

    await waitFor(() => {
      expect(screen.getByLabelText("City name")).toHaveValue("Sofia");
    });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(screen.getByText("Sofia")).toBeInTheDocument();
    });

    const postCall = fetchMock.mock.calls.find(
      ([url, options]) =>
        url === "http://localhost:8800/cities" && options?.method === "POST",
    );
    expect(postCall).toBeTruthy();
  });
});
