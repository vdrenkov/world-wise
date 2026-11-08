import { z } from "zod";

import { citySchema, localDate } from "../types";

import type { City } from "../types";

export const STORAGE_KEY = "worldwise.cities";

const storedCitySchema = citySchema.extend({
  notes: citySchema.shape.notes.default(""),
  id: z
    .union([z.string(), z.number().finite()])
    .transform(String)
    .pipe(citySchema.shape.id),
  date: z
    .union([z.iso.date(), z.iso.datetime()])
    .transform((value) =>
      value.length === 10 ? value : localDate(new Date(value)),
    ),
  position: z
    .object({
      lat: z
        .union([z.number(), z.string().trim().min(1)])
        .pipe(z.coerce.number()),
      lng: z
        .union([z.number(), z.string().trim().min(1)])
        .pipe(z.coerce.number()),
    })
    .pipe(citySchema.shape.position),
});

const storedCitiesSchema = z
  .array(storedCitySchema)
  .refine(
    (cities) => new Set(cities.map((city) => city.id)).size === cities.length,
    "Trip ids must be unique.",
  );

export function readCities(): City[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === null) {
    return [];
  }

  return storedCitiesSchema.parse(JSON.parse(stored));
}

export function saveCities(cities: City[]): void {
  const validated = z.array(citySchema).parse(cities);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
}
