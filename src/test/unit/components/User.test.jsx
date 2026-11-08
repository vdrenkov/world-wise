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

  it("renderUser_demoSession_showsNameAndDisclosure", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        name: "Valentin",
        avatar: "https://i.pravatar.cc/100?u=zz",
      },
      logout,
    });

    render(<User />);

    expect(screen.getByText(/Welcome, Valentin/)).toBeInTheDocument();
    expect(screen.getByText("Local demo journal")).toBeInTheDocument();
  });

  it("logout_demoSession_returnsHome", () => {
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
