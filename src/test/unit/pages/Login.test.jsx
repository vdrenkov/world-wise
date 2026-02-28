import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Login from "../../../pages/Login";
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

vi.mock("../../../components/PageNav", () => ({
  default: () => <nav>PageNav</nav>,
}));

vi.mock("../../../components/Button", () => ({
  default: ({ children }) => <button>{children}</button>,
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("Login", () => {
  const login = vi.fn();

  beforeEach(() => {
    login.mockReset();
    mockedNavigate.mockReset();
    mockedUseAuth.mockReset();
  });

  it("submits with default credentials", () => {
    mockedUseAuth.mockReturnValue({ login, isAuthenticated: false });

    render(<Login />);

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(login).toHaveBeenCalledWith("vdrenkov@example.com", "qwerty");
  });

  it("does not call login when email is empty", () => {
    mockedUseAuth.mockReturnValue({ login, isAuthenticated: false });

    render(<Login />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(login).not.toHaveBeenCalled();
  });

  it("redirects authenticated users to app layout", async () => {
    mockedUseAuth.mockReturnValue({ login, isAuthenticated: true });

    render(<Login />);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/app", { replace: true });
    });
  });
});
