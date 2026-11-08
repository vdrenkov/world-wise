import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Form from "../../../components/Form";
import { useCities } from "../../../contexts/CitiesContext";

vi.mock("../../../contexts/CitiesContext", () => ({ useCities: vi.fn() }));
const createCity = vi.fn();

beforeEach(() => {
  createCity.mockReset();
  vi.mocked(useCities).mockReturnValue({ createCity, isLoading: false });
});

describe("Trip form", () => {
  it("submitTrip_validManualEntry_passesTypedDataWithoutGeocoding", async () => {
    createCity.mockResolvedValue(false);
    render(
      <MemoryRouter initialEntries={["/app/form?lat=0&lng=0"]}>
        <Form />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText("City name"), {
      target: { value: "  Null Island  " },
    });
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "Atlantic Ocean" },
    });
    fireEvent.change(screen.getByLabelText("Visit date"), {
      target: { value: "2026-01-20" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add", exact: true }));

    await waitFor(() =>
      expect(createCity).toHaveBeenCalledWith({
        cityName: "Null Island",
        country: "Atlantic Ocean",
        emoji: "📍",
        date: "2026-01-20",
        notes: "",
        position: { lat: 0, lng: 0 },
      }),
    );
    expect(screen.getByLabelText("City name")).toHaveValue("  Null Island  ");
  });

  it("submitTrip_invalidEntry_showsValidationWithoutSaving", () => {
    render(
      <MemoryRouter initialEntries={["/app/form?lat=0&lng=0"]}>
        <Form />
      </MemoryRouter>,
    );
    fireEvent.submit(
      screen.getByRole("button", { name: "Add", exact: true }).closest("form"),
    );

    expect(createCity).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a city, country, valid coordinates",
    );
  });

  it("submitTrip_futureDate_rejectsUnvisitedPlace", () => {
    render(
      <MemoryRouter initialEntries={["/app/form?lat=0&lng=0"]}>
        <Form />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText("City name"), {
      target: { value: "Paris" },
    });
    fireEvent.change(screen.getByLabelText("Country"), {
      target: { value: "France" },
    });
    fireEvent.change(screen.getByLabelText("Visit date"), {
      target: { value: "2999-01-01" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Add", exact: true }).closest("form"),
    );

    expect(createCity).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("not in the future");
  });
});
