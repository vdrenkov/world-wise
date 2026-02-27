import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthProvider, useAuth } from "../../../contexts/FakeAuthContext";

function AuthHarness() {
  const { isAuthenticated, login, logout, user } = useAuth();

  return (
    <div>
      <p data-testid="status">
        {isAuthenticated ? "authenticated" : "anonymous"}
      </p>
      <p data-testid="username">{user?.name ?? "none"}</p>
      <button onClick={() => login("wrong@example.com", "wrong")}>Login invalid</button>
      <button onClick={() => login("vdrenkov@example.com", "qwerty")}>Login valid</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("FakeAuthContext", () => {
  it("keeps the user unauthenticated for invalid credentials", () => {
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Login invalid" }));

    expect(screen.getByTestId("status")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("username")).toHaveTextContent("none");
  });

  it("logs in with valid credentials and can log out", () => {
    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Login valid" }));
    expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    expect(screen.getByTestId("username")).toHaveTextContent("Valentin");

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));
    expect(screen.getByTestId("status")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("username")).toHaveTextContent("none");
  });
});
