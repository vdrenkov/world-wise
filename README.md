# WorldWise

A travel journal built with React and TypeScript. Pin places on a world map, record visit dates and notes, and revisit your cities and countries. Trips stay in your browser.

![WorldWise homepage](docs/preview.png)

[Hosted demo](https://world-wise-vdrenkov.netlify.app/) · [Journal preview](docs/journal.png)

## Run locally

Use **Node 26.13.0 LTS** from `.nvmrc` and its bundled npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. The public demo login is prefilled:

```text
Email: vdrenkov@example.com
Password: qwerty
```

This is a navigation demo, not authentication. It does not protect or isolate data. Reloading ends the demo session; logging out keeps the journal.

## Using the journal

- Click the map to select a point, then enter the city, country, visit date, and optional notes. Keyboard users can select **Add a place** and enter coordinates instead.
- **Use current location** requests browser location permission and sends the resulting coordinates to BigDataCloud to suggest a name. Denying permission or a failed lookup leaves manual entry available.
- Browse trip details and countries, or delete a trip from the cities list. **Use your position** recenters the map without naming or saving a place.
- Trips are saved under `worldwise.cities` in `localStorage`. Earlier numeric ids, coordinate strings, and timestamp dates are read and normalized. Invalid saved data is preserved and reported; resetting an unreadable journal requires confirmation.

There is no backend, subscription, sharing, cloud sync, or offline map. Clearing site data removes the journal. Storage is shared by tabs and demo sessions in the same browser profile. Tabs reload changes from storage, but simultaneous writes across tabs are not transactional. Avoid sensitive notes on shared devices.

## Stack and structure

React 19.3, React Router 8, Vite 8, strict TypeScript 6, React Leaflet 5 / Leaflet 1.9, CSS Modules, and Zod runtime validation.

`src/contexts` owns the demo session and saved trips. `src/services` validates persistence and geocoding responses. Components and pages provide the journal, map, and public routes. The map and public pages are loaded on demand. Leaflet styles and marker assets are bundled locally.

TypeScript 6.0 is the newest release supported by the current `typescript-eslint` peer range. A narrow `tsconfig.json` mapping resolves React Leaflet 5’s internal declaration import to the declaration shipped by its core package; library type checking remains enabled. The `minimatch` override keeps transitive tooling on its patched release. See the [compatibility requirements](https://typescript-eslint.io/users/dependency-versions/) and [security advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249).

## Verification

```bash
npm run lint
npm run format:check
npm run test:coverage
npm run build
npm audit --audit-level=low
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

`build` checks application, browser-test, and tool configuration types before bundling. Vitest covers storage compatibility and corruption, failed writes, trip validation, routing, demo access, and geolocation. Coverage gates are 90% statements/lines, 80% branches, and 85% functions.

Playwright starts the production preview over HTTPS with the deployment headers and exercises the journal in Chromium, Firefox, WebKit, and mobile Chromium. Its temporary local certificate is self-signed and accepted only by the test browser. Scenarios include persistence after reload, map selection, zero coordinates, cross-tab updates, storage and provider failures, legacy data, recovery routes, keyboard navigation, automated accessibility checks, and horizontal overflow. External tile and geocoding responses are controlled in these tests. Automated accessibility checks complement visual and keyboard review.

GitHub Actions runs the checks above on pull requests and pushes to `develop` or `master`, retaining coverage and browser reports. Dependabot checks npm dependencies and pinned Actions weekly. These workflows run after publication to GitHub.

For local SonarQube, run `npm run test:coverage`, start a disposable local Community server on port 9010, and generate an analysis token on that server. With `SONAR_TOKEN` in the environment:

```bash
docker run --rm -e SONAR_TOKEN -e SONAR_HOST_URL=http://host.docker.internal:9010 -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli:latest '-Dsonar.qualitygate.wait=true'
```

The scanner reads `sonar-project.properties` and `coverage/lcov.info`. Use a local server because a Community analysis replaces the project’s main analysis.

## Providers and deployment

Map tiles come from OpenStreetMap with visible attribution. The optional location lookup uses BigDataCloud’s free client endpoint only for a fresh device location. Both services require connectivity and may be unavailable or rate limited. The journal remains usable through manual coordinates and names. Follow the [tile policy](https://operations.osmfoundation.org/policies/tiles/) and [current-location API terms](https://www.bigdatacloud.com/docs/free-api/free-reverse-geocode-to-city-api); use a suitable hosted service for heavier traffic. There is no bulk tile download or arbitrary-coordinate geocoding.

`npm run build` produces `dist/`. Deploy that directory over HTTPS so browser geolocation works. Netlify receives SPA redirects and security headers from `public/_redirects` and `public/_headers`. Other hosts need equivalent routing and headers. The content policy allows the bundled application, OpenStreetMap tile images, and BigDataCloud requests; inline styles support Leaflet’s positioning. Zod runs without dynamic compilation, so scripts do not require `unsafe-eval`. Update the canonical URL, social metadata, `robots.txt`, and `sitemap.xml` when changing domains. The web manifest supplies install metadata; it does not provide offline support.

## Attribution

Started from _The Ultimate React Course_ by Jonas Schmedtmann and developed as an educational portfolio project. Existing travel photography comes from the course assets. Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
