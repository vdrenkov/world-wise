import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CityItem from "../../../components/CityItem";
import { useCities } from "../../../contexts/CitiesContext";

vi.mock("../../../contexts/CitiesContext", () => ({
  useCities: vi.fn(),
}));

const mockedUseCities = vi.mocked(useCities);

const city = {
  id: 1,
  cityName: "Sofia",
  emoji: "🇧🇬",
  date: "2026-01-10T00:00:00.000Z",
  position: { lat: 42.6977, lng: 23.3219 },
};

describe("CityItem", () => {
  const deleteCity = vi.fn();

  beforeEach(() => {
    deleteCity.mockReset();
    mockedUseCities.mockReset();
  });

  it("builds a city details link with lat/lng query params", () => {
    mockedUseCities.mockReturnValue({
      currentCity: {},
      deleteCity,
    });

    render(
      <MemoryRouter>
        <CityItem city={city} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/1?lat=42.6977&lng=23.3219",
    );
  });

  it("marks the current city item as active", () => {
    mockedUseCities.mockReturnValue({
      currentCity: { id: 1 },
      deleteCity,
    });

    render(
      <MemoryRouter>
        <CityItem city={city} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link").className).toContain("cityItem--active");
  });

  it("deletes the city when the delete button is clicked", () => {
    mockedUseCities.mockReturnValue({
      currentCity: {},
      deleteCity,
    });

    render(
      <MemoryRouter>
        <CityItem city={city} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete Sofia" }));

    expect(deleteCity).toHaveBeenCalledWith(1);
  });
});
