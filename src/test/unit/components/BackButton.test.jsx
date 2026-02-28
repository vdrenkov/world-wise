import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import BackButton from "../../../components/BackButton";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("BackButton", () => {
  it("navigates one step back when clicked", () => {
    render(<BackButton />);

    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});
