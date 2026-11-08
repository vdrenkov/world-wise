import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { berlin, sofia } from "../src/test/fixtures";

import type { City } from "../src/types";
import type { Page } from "@playwright/test";

const tile =
  '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e0e8dc"/><path d="M0 128H256M128 0V256" stroke="#c5d4cc"/></svg>';

test.beforeEach(async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.fulfill({ contentType: "image/svg+xml", body: tile }),
  );
});

test("renderJournal_securityHeaders_allowsRequiredAssetsWithoutPolicyViolations", async ({
  page,
}) => {
  const violations: string[] = [];
  await page.addInitScript(() =>
    document.addEventListener("securitypolicyviolation", (event) =>
      console.error(`CSP violation: ${event.violatedDirective}`),
    ),
  );
  page.on("console", (message) => {
    if (message.text().includes("CSP violation:"))
      violations.push(message.text());
  });
  await enterJournal(page, [sofia]);
  await expect(page.locator(".leaflet-tile-loaded").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Sofia/ })).toBeVisible();
  expect(violations).toEqual([]);
});

test("synchronizeJournal_anotherTabSaves_keepsOpenTripAndUpdatesMap", async ({
  page,
  context,
}) => {
  await enterJournal(page, [sofia]);
  await page.getByRole("link", { name: /Sofia/ }).click();
  await expect(page.getByText(sofia.notes)).toBeVisible();
  const secondTab = await context.newPage();
  await secondTab.route("https://tile.openstreetmap.org/**", (route) =>
    route.fulfill({ contentType: "image/svg+xml", body: tile }),
  );
  await secondTab.goto("/login");
  await secondTab.getByRole("button", { name: "Login", exact: true }).click();
  await secondTab.getByRole("link", { name: "+ Add a place" }).click();
  await secondTab.getByLabel("Latitude", { exact: true }).fill("52.52");
  await secondTab.getByLabel("Longitude", { exact: true }).fill("13.405");
  await fillTrip(secondTab, "Berlin", "Germany");
  await secondTab.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(2);
  await expect(page.getByText(sofia.notes)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Trip not found" }),
  ).toHaveCount(0);
  await secondTab.close();
});

test("createTrip_mapSelection_savesDetailsAndPersistsAfterReload", async ({
  page,
}) => {
  await enterJournal(page);
  await page
    .locator(".leaflet-container")
    .click({ position: { x: 120, y: 140 } });
  await expect(
    page.getByRole("heading", { name: "Add a place", exact: true }),
  ).toBeVisible();
  await fillTrip(page, "Lisbon", "Portugal");
  await page.getByLabel(/Trip notes/).fill("Pastéis and a long walk.");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("link", { name: /Lisbon/ }).click();
  await expect(page.getByText("Pastéis and a long walk.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Check out Lisbon/ }),
  ).toHaveAttribute("href", "https://en.wikipedia.org/wiki/Lisbon");
  await page.reload();
  await expect(page.getByRole("heading", { name: /Go places/ })).toBeVisible();
  await page.getByRole("link", { name: "Login", exact: true }).click();
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByRole("link", { name: /Lisbon/ })).toBeVisible();
});

test("createTrip_keyboardCoordinates_acceptsEquatorAndPrimeMeridian", async ({
  page,
}) => {
  await enterJournal(page);
  await page.getByRole("link", { name: "+ Add a place" }).click();
  await page.getByLabel("Latitude", { exact: true }).fill("0");
  await page.getByLabel("Longitude", { exact: true }).fill("0");
  await fillTrip(page, "Null Island", "Atlantic Ocean");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("link", { name: /Null Island/ })).toBeVisible();
  const stored: City[] = await readJournal(page);
  expect(stored[0]?.position).toEqual({ lat: 0, lng: 0 });
});

test("deleteTrip_savedPlaces_updatesCountriesAndStorage", async ({ page }) => {
  await enterJournal(page, [
    sofia,
    berlin,
    { ...sofia, id: "plovdiv", cityName: "Plovdiv" },
  ]);
  await page.getByRole("link", { name: "Countries", exact: true }).click();
  await expect(page.getByText("Bulgaria", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Germany", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Cities", exact: true }).click();
  await page.getByRole("button", { name: "Delete Berlin" }).click();
  await expect(page.getByRole("link", { name: /Berlin/ })).toHaveCount(0);
  expect(await readJournal(page)).toHaveLength(2);
});

test("saveTrip_storageQuotaFailure_keepsInputAndExistingData", async ({
  page,
}) => {
  await enterJournal(page, [sofia]);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page.getByRole("link", { name: "+ Add a place" }).click();
  await page.getByLabel("Latitude", { exact: true }).fill("40");
  await page.getByLabel("Longitude", { exact: true }).fill("10");
  await fillTrip(page, "Rome", "Italy");
  await expect(page.getByLabel("Latitude", { exact: true })).toHaveValue("40");
  await expect(page.getByLabel("Longitude", { exact: true })).toHaveValue("10");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("could not be saved");
  await expect(page.getByLabel("City name")).toHaveValue("Rome");
  expect(await readJournal(page)).toEqual([sofia]);
});

test("deleteTrip_storageFailure_keepsTripVisible", async ({ page }) => {
  await enterJournal(page, [sofia]);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Unavailable");
    };
  });
  await page.getByRole("button", { name: "Delete Sofia" }).click();
  await expect(page.getByRole("alert")).toContainText("could not be deleted");
  await expect(page.getByRole("link", { name: /Sofia/ })).toBeVisible();
});

test("loadJournal_corruptData_preservesUntilConfirmedReset", async ({
  page,
}) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.setItem("worldwise.cities", "broken"));
  await page.reload();
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "original data has not been changed",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("worldwise.cities")),
  ).toBe("broken");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Reset local journal" }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("worldwise.cities")),
  ).toBe("broken");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset local journal" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("worldwise.cities")),
  ).toBeNull();
});

test("loadJournal_legacyData_normalizesCoordinatesAndDate", async ({
  page,
}) => {
  await page.goto("/login");
  await page.evaluate(
    (city) =>
      localStorage.setItem(
        "worldwise.cities",
        JSON.stringify([
          {
            ...city,
            id: 42,
            date: "2026-01-10T00:00:00.000Z",
            position: { lat: "42.6977", lng: "23.3219" },
          },
        ]),
      ),
    sofia,
  );
  await page.reload();
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.getByRole("link", { name: /Sofia/ }).click();
  await expect(page.getByText(sofia.notes)).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("nameLocation_validGps_suggestsCityOnlyOnExplicitRequest", async ({
  page,
}) => {
  await mockGeolocation(page, true);
  let lookups = 0;
  await page.route("https://api.bigdatacloud.net/**", (route) => {
    lookups += 1;
    return route.fulfill({
      json: { city: "Sofia", countryName: "Bulgaria", countryCode: "BG" },
    });
  });
  await enterJournal(page);
  await page.getByRole("link", { name: "+ Add a place" }).click();
  expect(lookups).toBe(0);
  await page
    .getByRole("button", { name: "Use current location", exact: true })
    .click();
  await expect(page.getByLabel("City name")).toHaveValue("Sofia");
  await expect(page.getByLabel("Country", { exact: true })).toHaveValue(
    "Bulgaria",
  );
  expect(lookups).toBe(1);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("link", { name: /Sofia/ })).toBeVisible();
});

test("nameLocation_providerFailure_keepsManualEntryAvailable", async ({
  page,
}) => {
  await mockGeolocation(page, true);
  await page.route("https://api.bigdatacloud.net/**", (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await enterJournal(page);
  await page.getByRole("link", { name: "+ Add a place" }).click();
  await page
    .getByRole("button", { name: "Use current location", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Enter the city and country manually",
  );
  await fillTrip(page, "Sofia", "Bulgaria");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("link", { name: /Sofia/ })).toBeVisible();
});

test("locateMap_permissionDenied_showsRecoverableFeedback", async ({
  page,
}) => {
  await mockGeolocation(page, false);
  await enterJournal(page);
  await page.getByRole("button", { name: "Use your position" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Location permission denied",
  );
  await page.getByRole("link", { name: "+ Add a place" }).click();
  await expect(page.getByLabel("City name")).toBeVisible();
});

test("renderMap_tileFailure_offersCoordinateFallback", async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await enterJournal(page);
  await expect(page.getByText(/Map tiles are unavailable/)).toBeVisible();
  await page
    .getByRole("link", { name: "Add a place using coordinates." })
    .click();
  await expect(page.getByLabel("Latitude", { exact: true })).toBeVisible();
});

test("openRoutes_missingTripAndUnknownPath_providesRecovery", async ({
  page,
}) => {
  await enterJournal(page);
  await page.evaluate(() => {
    window.history.pushState(
      {},
      "",
      "/app/cities/missing?lat=not-a-number&lng=0",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(
    page.getByRole("heading", { name: "Trip not found" }),
  ).toBeVisible();
  await page.goto("/unknown");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Back to home/ }).click();
  await expect(page.getByRole("heading", { name: /Go places/ })).toBeVisible();
});

test("login_invalidCredentials_showsDemoGuidance", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "public demo credentials",
  );
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
    "wrong",
  );
});

test("navigateWithKeyboard_skipLinkAndRouteFocus_supportsKeyboardAccess", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Go places/ })).toBeVisible();
  await page.bringToFront();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#page-content")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: /Start your journal/ }),
  ).toBeFocused();
  await page.getByRole("link", { name: "The journal" }).click();
  await expect(page.locator("#page-content")).toBeFocused();
});

test("renderPublicPages_accessibilityAndResponsiveLayout_passesAutomatedChecks", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (exception) => pageErrors.push(exception.message));
  await page.goto("/");
  await checkAccessiblePage(page);
  await page.getByRole("link", { name: "The journal" }).click();
  await checkAccessiblePage(page);
  await page.getByRole("link", { name: "Free demo" }).click();
  await checkAccessiblePage(page);
  await page.getByRole("link", { name: "Login", exact: true }).click();
  await checkAccessiblePage(page);
  expect(pageErrors).toEqual([]);
});

test("renderJournalPages_accessibilityAndResponsiveLayout_passesAutomatedChecks", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (exception) => pageErrors.push(exception.message));
  await enterJournal(page, [sofia]);
  await checkAccessiblePage(page);
  await page.getByRole("link", { name: "Countries", exact: true }).click();
  await checkAccessiblePage(page);
  await page.getByRole("link", { name: "Cities", exact: true }).click();
  await page.getByRole("link", { name: /Sofia/ }).click();
  await checkAccessiblePage(page);
  await page.getByRole("link", { name: "+ Add a place" }).click();
  await checkAccessiblePage(page);
  expect(pageErrors).toEqual([]);
});

async function enterJournal(page: Page, cities: City[] = []) {
  await page.goto("/login");
  await page.evaluate(
    (saved) => localStorage.setItem("worldwise.cities", JSON.stringify(saved)),
    cities,
  );
  await page.reload();
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByRole("link", { name: "+ Add a place" })).toBeVisible();
}

async function fillTrip(page: Page, cityName: string, country: string) {
  await page.getByLabel("City name").fill(cityName);
  await page.getByLabel("Country", { exact: true }).fill(country);
  await page.getByLabel("Visit date").fill("2026-01-20");
}

async function readJournal(page: Page): Promise<City[]> {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("worldwise.cities") ?? "[]"),
  );
}

async function mockGeolocation(page: Page, allowed: boolean) {
  await page.addInitScript((permission) => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (
          success: PositionCallback,
          failure: PositionErrorCallback,
        ) => {
          if (permission)
            success({
              coords: { latitude: 42.6977, longitude: 23.3219 },
            } as GeolocationPosition);
          else
            failure({
              code: 1,
              message: "Location permission denied",
            } as GeolocationPositionError);
        },
      },
    });
  }, allowed);
}

async function checkAccessiblePage(page: Page) {
  await expect(page.locator("h1")).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}
