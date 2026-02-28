import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCities } from "../../../contexts/CitiesContext";
import { useAuth } from "../../../contexts/FakeAuthContext";

describe("context hook guards", () => {
  it("throws when useCities is used outside CitiesProvider", () => {
    expect(() => renderHook(() => useCities())).toThrow(
      "CitiesContext was used outside the CitiesProvider.",
    );
  });

  it("throws when useAuth is used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "AuthContext was used outside AuthProvider.",
    );
  });
});
