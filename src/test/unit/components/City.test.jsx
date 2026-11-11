import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import City from "../../../components/City";
import { useCities } from "../../../contexts/CitiesContext";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock("../../../contexts/CitiesContext", () => ({
  useCities: vi.fn(),
}));

vi.mock("../../../components/BackButton", () => ({
  default: () => <button>Back</button>,
}));

const mockedUseCities = vi.mocked(useCities);

describe("City", () => {
  const getCity = vi.fn();

  beforeEach(async () => {
    getCity.mockReset();
    const reactRouter = await import("react-router");
    vi.mocked(reactRouter.useParams).mockReturnValue({ id: "7" });
  });

  it("renderCity_routeId_loadsTrip", () => {
    mockedUseCities.mockReturnValue({
      getCity,
      currentCity: {
        cityName: "Lisbon",
        emoji: "🇵🇹",
        date: "2026-01-10T00:00:00.000Z",
        notes: "Ocean views",
      },
    });

    render(<City />);

    expect(getCity).toHaveBeenCalledWith("7");
  });

  it("renderCity_missingTrip_showsRecoveryWithoutDetails", () => {
    mockedUseCities.mockReturnValue({
      getCity,
    });

    render(<City />);

    expect(
      screen.getByRole("heading", { name: "Trip not found" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Wikipedia/ }),
    ).not.toBeInTheDocument();
  });

  it("renderCity_savedTrip_showsNotesAndWikipediaLink", () => {
    mockedUseCities.mockReturnValue({
      getCity,
      currentCity: {
        cityName: "Lisbon",
        emoji: "🇵🇹",
        date: "2026-01-10T00:00:00.000Z",
        notes: "Ocean views",
      },
    });

    render(<City />);

    expect(
      screen.getByRole("heading", { level: 1, name: /lisbon/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ocean views")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /check out lisbon on wikipedia/i }),
    ).toHaveAttribute("href", "https://en.wikipedia.org/wiki/Lisbon");
  });

  it("renderCity_emptyNotes_omitsNotesSection", () => {
    mockedUseCities.mockReturnValue({
      getCity,
      currentCity: {
        cityName: "Lisbon",
        emoji: "🇵🇹",
        date: "2026-01-10T00:00:00.000Z",
        notes: "",
      },
    });

    render(<City />);

    expect(
      screen.queryByRole("heading", { name: "Your notes" }),
    ).not.toBeInTheDocument();
  });
});
