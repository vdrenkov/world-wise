import { useEffect, useRef, useState } from "react";

import { positionSchema } from "../types";

import type { Position } from "../types";

export function useGeolocation(defaultPosition?: Position) {
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function getPosition(): Promise<Position | undefined> {
    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation.");
      return undefined;
    }

    setError(null);
    setIsLoading(true);
    try {
      const located = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            maximumAge: 0,
            enableHighAccuracy: false,
          });
        },
      );

      if (!mountedRef.current) {
        return undefined;
      }

      const validated = positionSchema.parse({
        lat: located.coords.latitude,
        lng: located.coords.longitude,
      });

      if (mountedRef.current) {
        setPosition(validated);
      }

      return validated;
    } catch (exception) {
      if (mountedRef.current) {
        setError(
          exception instanceof Error ||
            (typeof exception === "object" &&
              exception !== null &&
              "message" in exception)
            ? String(exception.message)
            : "Your location is unavailable. Choose a point on the map instead.",
        );
      }

      return undefined;
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }

  return { isLoading, position, error, getPosition };
}
