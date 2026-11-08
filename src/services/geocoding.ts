import { z } from "zod";

import { convertToEmoji } from "../types";

import type { Position } from "../types";

const responseSchema = z.object({
  city: z.string().optional(),
  locality: z.string().optional(),
  countryName: z.string().trim().min(1).max(100),
  countryCode: z.string().regex(/^[a-z]{2}$/i),
});

export async function nameCurrentLocation(
  position: Position,
  signal: AbortSignal,
) {
  const parameters = new URLSearchParams({
    latitude: String(position.lat),
    longitude: String(position.lng),
    localityLanguage: "en",
  });
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${parameters}`,
    { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) },
  );

  if (!response.ok) {
    throw new Error(
      "Location naming is unavailable. Enter the city and country manually.",
    );
  }

  const data = responseSchema.parse(await response.json());
  return {
    cityName: data.city || data.locality || "",
    country: data.countryName,
    emoji: convertToEmoji(data.countryCode),
  };
}
