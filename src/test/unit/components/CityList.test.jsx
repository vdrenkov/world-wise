import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CityList from "../../../components/CityList";
import { useCities } from "../../../contexts/CitiesContext";

vi.mock("../../../contexts/CitiesContext", () => ({
  useCities: vi.fn(),
}));

vi.mock("../../../components/CityItem", () => ({
  default: ({ city }) => <li>{city.cityName}</li>,
}));

vi.mock("../../../components/Message", () => ({
  default: ({ message }) => <p>{message}</p>,
}));

const mockedUseCities = vi.mocked(useCities);

describe("CityList", () => {
  beforeEach(() => {
    mockedUseCities.mockReset();
  });

  it("renderCityList_emptyJournal_showsFirstTripGuidance", () => {
    mockedUseCities.mockReturnValue({ cities: [] });

    render(<CityList />);

    expect(
      screen.getByText("Add your first city by clicking on a city on the map."),
    ).toBeInTheDocument();
  });

  it("renderCityList_savedTrips_showsCities", () => {
    mockedUseCities.mockReturnValue({
      cities: [
        { id: 1, cityName: "Sofia" },
        { id: 2, cityName: "Berlin" },
      ],
    });

    render(<CityList />);

    expect(screen.getByText("Sofia")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
  });
});
