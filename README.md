## Angular 18 PWA Form

An Angular 18 Progressive Web App demonstrating offline-first form submission with background sync and photo attachments.

### Features

- **Form submission**: Capture `title`, `body`, and optional photos.
- **Photo capture**: Use the device camera to take pictures.
- **Gallery selection**: Pick existing images from the device gallery.
- **Offline support**: Store submissions in IndexedDB when offline.
- **Background sync**: Automatically syncs pending submissions when back online.
- **Submissions list**: View all synced and pending submissions.

### Tech Stack

- **Framework**: Angular 18 with standalone components and reactive forms
- **PWA**: `@angular/service-worker`, `manifest.webmanifest`, `ngsw-config.json`
- **Storage**: IndexedDB for offline data
- **API**: [JSONPlaceholder](https://jsonplaceholder.typicode.com) as a demo REST backend

### Getting Started

#### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

#### Install dependencies

```bash
npm install
```

If you see `Cannot find module '@angular/service-worker'`, install it explicitly:

```bash
npm install @angular/service-worker
```

#### Run in development

```bash
npm start
```

Then open `http://localhost:4200` in your browser.  
The service worker is **disabled** in development mode.

### Build as PWA

```bash
npm run build
```

The production build is emitted to `dist/angular-pwa-app/` and includes:

- `ngsw-worker.js` – Angular service worker
- `ngsw.json` – service worker manifest
- `manifest.webmanifest` – PWA manifest

Serve the `dist/angular-pwa-app` folder over HTTPS (or `http://localhost`) to test installability and offline behavior.

### Project Structure (high level)

- `src/app/components/form` – main form for creating submissions
- `src/app/components/submissions-list` – list of existing and pending submissions
- `src/app/services/api.service.ts` – HTTP calls to the backend API
- `src/app/services/offline-storage.service.ts` – IndexedDB storage layer
- `src/app/services/sync.service.ts` – synchronization and background sync logic
- `ngsw-config.json` – Angular service worker configuration

### License

This project is provided for learning and demo purposes. Adapt and reuse as needed.
