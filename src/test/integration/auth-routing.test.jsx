import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { AuthProvider } from "../../contexts/FakeAuthContext";
import Login from "../../pages/Login";
import ProtectedRoute from "../../pages/ProtectedRoute";

function renderAuthRoutingApp(initialEntries) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<p>Public home</p>} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <p>Private app</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("auth and routing integration", () => {
  it("redirects unauthenticated users away from protected routes", async () => {
    renderAuthRoutingApp(["/app"]);

    await waitFor(() => {
      expect(screen.getByText("Public home")).toBeInTheDocument();
    });
    expect(screen.queryByText("Private app")).not.toBeInTheDocument();
  });

  it("logs in and navigates to protected content", async () => {
    renderAuthRoutingApp(["/login"]);

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByText("Private app")).toBeInTheDocument();
    });
    expect(screen.queryByText("Public home")).not.toBeInTheDocument();
  });
});
