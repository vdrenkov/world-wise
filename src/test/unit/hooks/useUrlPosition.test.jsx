import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { useUrlPosition } from "../../../hooks/useUrlPosition";

function createWrapper(initialEntry) {
  return function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    );
  };
}

describe("useUrlPosition", () => {
  it("useUrlPosition_validParameters_returnsCoordinates", () => {
    const { result } = renderHook(() => useUrlPosition(), {
      wrapper: createWrapper("/app/form?lat=42.6977&lng=23.3219"),
    });

    expect(result.current).toEqual([42.6977, 23.3219]);
  });

  it("useUrlPosition_missingParameters_returnsNoPosition", () => {
    const { result } = renderHook(() => useUrlPosition(), {
      wrapper: createWrapper("/app/form"),
    });

    expect(result.current).toEqual([null, null]);
  });

  it.each([
    "lat=91&lng=10",
    "lat=1&lng=181",
    "lat=abc&lng=0",
    "lat=&lng=0",
    "lat=1",
  ])("useUrlPosition_invalidCoordinates_returnsNoPosition: %s", (query) => {
    const { result } = renderHook(() => useUrlPosition(), {
      wrapper: createWrapper(`/app/form?${query}`),
    });

    expect(result.current).toEqual([null, null]);
  });

  it("useUrlPosition_zeroCoordinates_keepsValidPosition", () => {
    const { result } = renderHook(() => useUrlPosition(), {
      wrapper: createWrapper("/app/form?lat=0&lng=0"),
    });

    expect(result.current).toEqual([0, 0]);
  });
});
