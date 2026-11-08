import { z } from "zod";

export const positionSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
});

export const newCitySchema = z.object({
  cityName: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  emoji: z.string().min(1).max(16),
  date: z.iso.date(),
  notes: z.string().trim().max(2000),
  position: positionSchema,
});

export const citySchema = newCitySchema.extend({
  id: z.string().min(1).max(100),
});

export type Position = z.infer<typeof positionSchema>;
export type NewCity = z.infer<typeof newCitySchema>;
export type City = z.infer<typeof citySchema>;

export function parsePosition(
  latitude: string | null,
  longitude: string | null,
): Position | undefined {
  if (!latitude?.trim() || !longitude?.trim()) {
    return undefined;
  }

  const result = positionSchema.safeParse({
    lat: Number(latitude),
    lng: Number(longitude),
  });
  return result.success ? result.data : undefined;
}

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function convertToEmoji(countryCode: string): string {
  if (!/^[a-z]{2}$/i.test(countryCode)) {
    return "📍";
  }

  return String.fromCodePoint(
    ...Array.from(
      countryCode.toUpperCase(),
      (character) => 127397 + character.charCodeAt(0),
    ),
  );
}
