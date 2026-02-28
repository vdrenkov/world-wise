import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Form from "../../../components/Form";
import { useCities } from "../../../contexts/CitiesContext";
import { useUrlPosition } from "../../../hooks/useUrlPosition";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock("react-datepicker", () => ({
  default: ({ id, selected, onChange }) => (
    <input
      id={id}
      data-testid="datepicker"
      value={selected ? "selected" : ""}
      onChange={() => onChange(selected)}
    />
  ),
}));

vi.mock("../../../contexts/CitiesContext", () => ({
  useCities: vi.fn(),
}));

vi.mock("../../../hooks/useUrlPosition", () => ({
  useUrlPosition: vi.fn(),
}));

vi.mock("../../../components/BackButton", () => ({
  default: () => <button type="button">Back</button>,
}));

const mockedUseCities = vi.mocked(useCities);
const mockedUseUrlPosition = vi.mocked(useUrlPosition);

describe("Form submission behavior", () => {
  const createCity = vi.fn();
  let fetchMock;

  beforeEach(() => {
    createCity.mockReset();
    mockedNavigate.mockReset();
    mockedUseCities.mockReset();
    mockedUseUrlPosition.mockReset();

    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    mockedUseUrlPosition.mockReturnValue(["42.6977", "23.3219"]);
    mockedUseCities.mockReturnValue({ createCity, isLoading: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("navigates to cities list when city creation succeeds", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        city: "Sofia",
        countryName: "Bulgaria",
        countryCode: "BG",
      }),
    });
    createCity.mockResolvedValue(true);

    render(<Form />);

    await waitFor(() => {
      expect(screen.getByLabelText("City name")).toHaveValue("Sofia");
    });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(createCity).toHaveBeenCalledOnce();
    });
    expect(mockedNavigate).toHaveBeenCalledWith("/app/cities");
  });

  it("does not navigate when city creation fails", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        city: "Sofia",
        countryName: "Bulgaria",
        countryCode: "BG",
      }),
    });
    createCity.mockResolvedValue(false);

    render(<Form />);

    await waitFor(() => {
      expect(screen.getByLabelText("City name")).toHaveValue("Sofia");
    });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(createCity).toHaveBeenCalledOnce();
    });
    expect(mockedNavigate).not.toHaveBeenCalledWith("/app/cities");
  });
});
