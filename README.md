# World Wise

Interactive travel-tracking app built with React, React Router, and Leaflet.  
Mark visited cities on a map, browse cities/countries lists, and persist entries in browser `localStorage`.

## Features

- Interactive world map with click-to-add city workflow.
- City and country views with route-based navigation.
- Mock authentication flow for protected app routes.
- Local persistence via browser `localStorage`.
- Unit and integration test coverage with Vitest + Testing Library.
- SEO/social metadata (canonical, Open Graph, Twitter cards, WebSite JSON-LD).
- Indexing assets: `robots.txt`, `sitemap.xml`, and SPA redirects (`_redirects`).
- PWA metadata via `manifest.webmanifest`.

## Tech Stack

- React 19
- React Router 7 (`react-router`)
- Vite 7
- React Leaflet 5
- ESLint 9 (flat config)

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.  

Visited cities are stored locally in your browser (`localStorage` key: `worldwise.cities`).

## Live Demo

- https://world-wise-vdrenkov.netlify.app/

## Demo Login

- Email: `vdrenkov@example.com`
- Password: `qwerty`

## Scripts

- `npm run dev` - start Vite dev server.
- `npm run build` - create production build in `dist/`.
- `npm run preview` - preview the production build locally.
- `npm run lint` - run ESLint checks.
- `npm test` - run Vitest in watch mode.
- `npm run test:run` - run Vitest once (CI-friendly).

## Testing

- Unit tests live in `src/test/unit`.
- Integration tests live in `src/test/integration`.
- Test environment is `jsdom` with `@testing-library/jest-dom` matchers.

## Quality Checks

Run all local quality gates:

```bash
npm run lint
npm run test:run
npm run build
```

## Deployment Notes

- Deploy the built `dist/` output.
- For Netlify, `public/_redirects` is included so client-side routes resolve to `index.html`.
- `public/robots.txt` and `public/sitemap.xml` are configured for the live domain.

## License

This project was created while following _The Ultimate React Course_ by Jonas Schmedtmann.  
The implementation in this repository is for educational and portfolio purposes only.
