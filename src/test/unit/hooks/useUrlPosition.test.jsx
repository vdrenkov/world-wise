import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { useUrlPosition } from "../../../hooks/useUrlPosition";

function createWrapper(initialEntry) {
  return function Wrapper({ children }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
  };
}

describe("useUrlPosition", () => {
  it("returns latitude and longitude from the URL search params", () => {
    const { result } = renderHook(() => useUrlPosition(), {
      wrapper: createWrapper("/app/form?lat=42.6977&lng=23.3219"),
    });

    expect(result.current).toEqual(["42.6977", "23.3219"]);
  });

  it("returns null coordinates when search params are missing", () => {
    const { result } = renderHook(() => useUrlPosition(), {
      wrapper: createWrapper("/app/form"),
    });

    expect(result.current).toEqual([null, null]);
  });
});
