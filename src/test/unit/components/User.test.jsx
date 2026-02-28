import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import User from "../../../components/User";
import { useAuth } from "../../../contexts/FakeAuthContext";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock("../../../contexts/FakeAuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("User", () => {
  const logout = vi.fn();

  beforeEach(() => {
    logout.mockReset();
    mockedNavigate.mockReset();
    mockedUseAuth.mockReset();
  });

  it("renders current user info", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        name: "Valentin",
        avatar: "https://i.pravatar.cc/100?u=zz",
      },
      logout,
    });

    render(<User />);

    expect(screen.getByAltText("Valentin")).toBeInTheDocument();
    expect(screen.getByText("Welcome, Valentin")).toBeInTheDocument();
  });

  it("logs out and navigates home on logout click", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        name: "Valentin",
        avatar: "https://i.pravatar.cc/100?u=zz",
      },
      logout,
    });

    render(<User />);

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(logout).toHaveBeenCalledOnce();
    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });
});
