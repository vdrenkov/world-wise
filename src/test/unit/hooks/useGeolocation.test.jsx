import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useGeolocation } from "../../../hooks/useGeolocation";

const originalGeolocation = navigator.geolocation;

function setGeolocation(value) {
  Object.defineProperty(globalThis.navigator, "geolocation", {
    configurable: true,
    value,
  });
}

afterEach(() => {
  setGeolocation(originalGeolocation);
});

describe("useGeolocation", () => {
  it("initializes with the provided default position", () => {
    const { result } = renderHook(() => useGeolocation({ lat: 12, lng: 34 }));

    expect(result.current.position).toEqual({ lat: 12, lng: 34 });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets an error when geolocation is not supported", () => {
    setGeolocation(undefined);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getPosition();
    });

    expect(result.current.error).toBe("Your browser does not support geolocation.");
    expect(result.current.isLoading).toBe(false);
  });

  it("stores coordinates when geolocation succeeds", () => {
    const getCurrentPosition = vi.fn((success) => {
      success({ coords: { latitude: 42.6977, longitude: 23.3219 } });
    });
    setGeolocation({ getCurrentPosition });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.getPosition();
    });

    expect(getCurrentPosition).toHaveBeenCalledOnce();
    expect(result.current.position).toEqual({ lat: 42.6977, lng: 23.3219 });
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
