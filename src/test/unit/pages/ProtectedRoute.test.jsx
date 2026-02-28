import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "../../../contexts/FakeAuthContext";
import ProtectedRoute from "../../../pages/ProtectedRoute";

vi.mock("../../../contexts/FakeAuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockedUseAuth.mockReset();
  });

  it("redirects unauthenticated users to the homepage", async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route path="/" element={<p>Public home</p>} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <p>Private app</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Public home")).toBeInTheDocument();
    });
    expect(screen.queryByText("Private app")).not.toBeInTheDocument();
  });

  it("renders children when the user is authenticated", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route path="/" element={<p>Public home</p>} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <p>Private app</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Private app")).toBeInTheDocument();
    expect(screen.queryByText("Public home")).not.toBeInTheDocument();
  });
});
