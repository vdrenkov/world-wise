# World Wise

Interactive travel-tracking app built with React, React Router, and Leaflet.  
Mark visited cities on a map, browse cities/countries lists, and manage entries through a local JSON API.

## Features

- Interactive world map with click-to-add city workflow.
- City and country views with route-based navigation.
- Mock authentication flow for protected app routes.
- Local API via `json-server` for city CRUD operations.
- SEO/social metadata (canonical, Open Graph, Twitter cards, WebSite JSON-LD).
- Indexing assets: `robots.txt`, `sitemap.xml`, and SPA redirects (`_redirects`).
- PWA metadata via `manifest.webmanifest`.

## Tech Stack

- React 19
- React Router 7 (`react-router`)
- Vite 7
- React Leaflet 5
- JSON Server 1.0.0-beta
- ESLint 9 (flat config)

## Getting Started

```bash
npm install
npm run server
npm run dev
```

The app runs on `http://localhost:5173` by default.  
The local API runs on `http://localhost:8800`.

## Scripts

- `npm run dev` - start Vite dev server.
- `npm run build` - create production build in `dist/`.
- `npm run preview` - preview the production build locally.
- `npm run lint` - run ESLint checks.
- `npm run server` - start local JSON Server API.

## Deployment Notes

- Deploy the built `dist/` output.
- For Netlify, `public/_redirects` is included so client-side routes resolve to `index.html`.

## License

This project was created while following _The Ultimate React Course_ by Jonas Schmedtmann.  
The implementation in this repository is for educational and portfolio purposes only.
