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

### Technical Details

#### Service Worker & Caching

- **Registration**: The Angular service worker is enabled via `ServiceWorkerModule` in `app.config.ts` and only runs in production builds.
- **Static asset caching**: `ngsw-config.json` defines asset groups for application shell files (JS, CSS, HTML, icons) so the app loads reliably even when offline.
- **Data caching (optional)**: API calls can be configured via `dataGroups` in `ngsw-config.json` for stale-while-revalidate or performance caching patterns.
- **Update behavior**: When a new version is deployed, the service worker downloads it in the background and activates on the next reload (standard Angular SW behavior).

#### Offline Storage (IndexedDB)

- `OfflineStorageService` abstracts IndexedDB operations so the rest of the app works with TypeScript models instead of raw DB APIs.
- New submissions are stored locally when:
  - The device is offline, or
  - An API call fails (network error or non-2xx status that should be retried).
- Each record tracks essential metadata (form payload plus flags such as “pending sync”) to allow safe retries.

#### Sync & Retry Logic

- `SyncService` coordinates:
  - Reading pending submissions from `OfflineStorageService`.
  - Sending them to the backend via `ApiService`.
  - Marking successfully synced items and cleaning them up locally.
- Sync triggers:
  - **Manual**: A “Sync now” action from the UI.
  - **Automatic**: On app startup, when connectivity is restored, and/or on a timer interval.
- Failures during sync fail **gracefully**:
  - Failed items remain pending in IndexedDB.
  - A later sync attempt can safely retry without data loss.

#### Connectivity Detection

- A dedicated `ConnectivityService` wraps `window.navigator.onLine` and online/offline browser events.
- Components and services can subscribe to an observable to:
  - Update UI state (e.g., show “Offline” banners or disable certain actions).
  - Trigger automatic sync when transitioning from offline → online.

#### API Integration

- `ApiService` encapsulates all HTTP calls to the backend (JSONPlaceholder in this demo).
- The rest of the app calls `ApiService` rather than `HttpClient` directly, which:
  - Centralizes error handling and logging.
  - Makes it easier to swap APIs or backends later.
  - Simplifies testing and mocking.

### License

This project is provided for learning and demo purposes. Adapt and reuse as needed.
