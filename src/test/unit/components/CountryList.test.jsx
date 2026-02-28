import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CountryList from "../../../components/CountryList";
import { useCities } from "../../../contexts/CitiesContext";

vi.mock("../../../contexts/CitiesContext", () => ({
  useCities: vi.fn(),
}));

vi.mock("../../../components/CountryItem", () => ({
  default: ({ country }) => <li>{country.country}</li>,
}));

vi.mock("../../../components/Message", () => ({
  default: ({ message }) => <p>{message}</p>,
}));

vi.mock("../../../components/Spinner", () => ({
  default: () => <p>Loading countries...</p>,
}));

const mockedUseCities = vi.mocked(useCities);

describe("CountryList", () => {
  beforeEach(() => {
    mockedUseCities.mockReset();
  });

  it("shows loading state while cities are loading", () => {
    mockedUseCities.mockReturnValue({ cities: [], isLoading: true });

    render(<CountryList />);

    expect(screen.getByText("Loading countries...")).toBeInTheDocument();
  });

  it("shows empty-state message when there are no cities", () => {
    mockedUseCities.mockReturnValue({ cities: [], isLoading: false });

    render(<CountryList />);

    expect(
      screen.getByText("Add your first city by clicking on a city on the map."),
    ).toBeInTheDocument();
  });

  it("renders only unique countries derived from cities", () => {
    mockedUseCities.mockReturnValue({
      isLoading: false,
      cities: [
        { id: 1, country: "Bulgaria", emoji: "🇧🇬" },
        { id: 2, country: "Germany", emoji: "🇩🇪" },
        { id: 3, country: "Bulgaria", emoji: "🇧🇬" },
      ],
    });

    render(<CountryList />);

    expect(screen.getByText("Bulgaria")).toBeInTheDocument();
    expect(screen.getByText("Germany")).toBeInTheDocument();
    expect(screen.getAllByText("Bulgaria")).toHaveLength(1);
  });
});
