import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  readCities,
  saveCities,
  STORAGE_KEY,
} from "../../services/cityStorage";
import { nameCurrentLocation } from "../../services/geocoding";
import {
  convertToEmoji,
  formatDate,
  localDate,
  parsePosition,
} from "../../types";
import { sofia } from "../fixtures";

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("City storage", () => {
  it("saveCities_longLegacyNotes_preservesExistingJournalDuringNewWrites", () => {
    const legacyCity = {
      ...sofia,
      notes: "A long travel memory. ".repeat(200),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([legacyCity]));
    const loaded = readCities();
    saveCities(loaded);

    expect(readCities()).toEqual([legacyCity]);
  });

  it("readCities_emptyStorage_returnsEmptyJournal", () =>
    expect(readCities()).toEqual([]));

  it("readCities_legacyRecord_normalizesWithoutWriting", () => {
    const raw = JSON.stringify([
      {
        ...sofia,
        id: 1,
        date: "2026-01-10T00:00:00.000Z",
        position: { lat: "42.6977", lng: "23.3219" },
      },
    ]);
    localStorage.setItem(STORAGE_KEY, raw);
    expect(readCities()).toEqual([{ ...sofia, id: "1" }]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });

  it.each([
    "null",
    "{}",
    "broken",
    JSON.stringify([{ ...sofia, date: "not-a-date" }]),
    JSON.stringify([sofia, sofia]),
    JSON.stringify([{ ...sofia, position: { lat: "", lng: "" } }]),
  ])("readCities_malformedJournal_rejectsData: %s", (raw) => {
    localStorage.setItem(STORAGE_KEY, raw);
    expect(() => readCities()).toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
  });

  it("saveCities_invalidInput_doesNotOverwriteJournal", () => {
    saveCities([sofia]);
    expect(() =>
      saveCities([{ ...sofia, position: { lat: 200, lng: 0 } }]),
    ).toThrow();
    expect(readCities()).toEqual([sofia]);
  });
});

describe("Current-location naming", () => {
  it("nameCurrentLocation_validResponse_normalizesSuggestion", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        locality: "Sofia",
        countryName: "Bulgaria",
        countryCode: "BG",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      nameCurrentLocation(sofia.position, new AbortController().signal),
    ).resolves.toEqual({ cityName: "Sofia", country: "Bulgaria", emoji: "🇧🇬" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("latitude=42.6977&longitude=23.3219"),
      { signal: expect.any(AbortSignal) },
    );
  });

  it("nameCurrentLocation_httpFailure_rejectsWithManualFallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(
      nameCurrentLocation(sofia.position, new AbortController().signal),
    ).rejects.toThrow("Enter the city and country manually");
  });

  it("nameCurrentLocation_invalidResponse_rejectsSuggestion", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ countryCode: "invalid" }),
      }),
    );
    await expect(
      nameCurrentLocation(sofia.position, new AbortController().signal),
    ).rejects.toThrow();
  });
});

describe("Trip values", () => {
  it("formatDate_calendarDate_doesNotShiftWithTimezone", () =>
    expect(formatDate("2026-01-10")).toBe("10 Jan 2026"));
  it("localDate_localMidnight_preservesCalendarDay", () =>
    expect(localDate(new Date(2026, 0, 10))).toBe("2026-01-10"));
  it("convertToEmoji_invalidCountry_usesNeutralPin", () =>
    expect(convertToEmoji("XYZ")).toBe("📍"));
  it("parsePosition_outOfRangeLongitude_rejectsCoordinates", () =>
    expect(parsePosition("0", "-181")).toBeUndefined());
});
