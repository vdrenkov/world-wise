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

vi.mock("../../../components/Spinner", () => ({
  default: () => <p>Loading cities...</p>,
}));

const mockedUseCities = vi.mocked(useCities);

describe("CityList", () => {
  beforeEach(() => {
    mockedUseCities.mockReset();
  });

  it("shows a loading state while cities are loading", () => {
    mockedUseCities.mockReturnValue({ cities: [], isLoading: true });

    render(<CityList />);

    expect(screen.getByText("Loading cities...")).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no cities", () => {
    mockedUseCities.mockReturnValue({ cities: [], isLoading: false });

    render(<CityList />);

    expect(
      screen.getByText("Add your first city by clicking on a city on the map."),
    ).toBeInTheDocument();
  });

  it("renders city items when cities are available", () => {
    mockedUseCities.mockReturnValue({
      cities: [
        { id: 1, cityName: "Sofia" },
        { id: 2, cityName: "Berlin" },
      ],
      isLoading: false,
    });

    render(<CityList />);

    expect(screen.getByText("Sofia")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
  });
});
