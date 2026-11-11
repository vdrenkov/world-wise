import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useCities } from "../../../contexts/CitiesContext";
import { useAuth } from "../../../contexts/FakeAuthContext";

describe("context hook guards", () => {
  it("useCities_missingProvider_throwsHelpfulError", () => {
    expect(() => renderHook(() => useCities())).toThrow(
      "CitiesContext was used outside the CitiesProvider.",
    );
  });

  it("useAuth_missingProvider_throwsHelpfulError", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "AuthContext was used outside AuthProvider.",
    );
  });
});
