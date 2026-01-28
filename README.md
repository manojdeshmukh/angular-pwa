# Angular 18 PWA Form

A sample Angular 18 Progressive Web App that supports:

- **Form submission** – title, body, and optional photos
- **Photo capture** – take photos with the device camera
- **Gallery selection** – pick images from the device gallery
- **Offline support** – form data stored in IndexedDB when offline
- **Sync with API** – syncs to [JSONPlaceholder](https://jsonplaceholder.typicode.com) when online (dummy API for demo)

## Setup

```bash
npm install
```

If the build fails with `Cannot find module '@angular/service-worker'`, install it explicitly:

```bash
npm install @angular/service-worker
```

## Development

```bash
npm start
```

Open `http://localhost:4200`. The service worker is **disabled** in development.

## PWA build

```bash
npm run build
```

Production build outputs to `dist/angular-pwa-app/` and includes:

- `ngsw-worker.js` – Angular service worker
- `ngsw.json` – service worker manifest
- `manifest.webmanifest` – PWA manifest

Serve the `dist/angular-pwa-app` folder over HTTPS (or `localhost`) to test the PWA and service worker.

## Features

- **Form**: Submit title, body, and add photos via **Take photo** (camera) or **Choose from gallery**.
- **Offline**: Submissions are saved locally when offline and synced automatically when back online.
- **Submissions**: View all submissions (synced vs pending) on the Submissions page.
- **Sync**: Manual **Sync now** in the header when online; automatic sync on interval and when coming online.

## Tech stack

- Angular 18, standalone components, reactive forms
- `@angular/service-worker` for PWA
- IndexedDB for offline storage
- JSONPlaceholder as dummy REST API
