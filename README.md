# WorldWise

A responsive travel journal. Pin places on a world map, save visit dates and notes, and revisit your cities and countries. Trips stay in your browser.

[Hosted demo](https://world-wise-vdrenkov.netlify.app/)

## Features

- Interactive map with saved places, trip details and country summaries.
- Manual city and country entry, with coordinates available for keyboard users.
- Optional current-location naming, with manual entry when permission or lookup fails.
- Local persistence, cross-tab updates and recovery for unreadable or unwritable storage.
- Responsive layouts, keyboard navigation and reduced-motion support.

## Stack

React 19 · React Router 8 · TypeScript 7 · Vite 8 · React Leaflet 5 · Leaflet 1.9 · CSS Modules · Zod 4.

## Run locally

Use **Node.js 26.13.0** from `.nvmrc` and **npm 12.2.2**.

```bash
npm install --global npm@12.2.2
npm ci
npm run dev
```

Open the URL printed by Vite. The demo login is prefilled with `vdrenkov@example.com` / `qwerty`. For a production preview, run `npm run build` followed by `npm run preview`.

In Netlify's build settings, leave the base directory empty, set the build command to `npm run build` and publish directory to `dist`. Set `NPM_VERSION=12.2.2` in its environment variables; `.nvmrc` selects Node.

## Verification

```bash
npm run check
npm audit --audit-level=low
```

`check` runs formatting, the strict TypeScript/Vite build and Vitest tests. Vitest and Testing Library cover storage, validation, routing, geolocation, map interactions and component flows using controlled location and geocoding responses.

GitHub Actions runs the same checks on pushes and pull requests.

## Demo boundaries

The public login demonstrates navigation, not authentication. It does not protect or isolate data. Reloading ends the demo session; logging out keeps the journal.

Trips are stored in `localStorage` and shared by tabs in the same browser profile. Clearing site data removes them. There is no backend, cloud sync or offline map. Simultaneous writes across tabs are not transactional; avoid sensitive notes on shared devices.

Map tiles come from OpenStreetMap. **Use current location** shares a fresh device location with BigDataCloud to suggest a name; map selections use manual names. **Use your position** only recenters the map. These providers require connectivity; manual coordinates and names remain available when they fail. Follow the [tile policy](https://operations.osmfoundation.org/policies/tiles/) and [current-location API terms](https://www.bigdatacloud.com/docs/free-api/free-reverse-geocode-to-city-api).

## Acknowledgments

Based on **The Ultimate React Course** by Jonas Schmedtmann. Travel photography comes from the course assets. Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). This is a personal portfolio project and is not for redistribution.
