import { Injectable, inject, signal, computed, NgZone } from '@angular/core';

const CHECK_URL = 'https://jsonplaceholder.typicode.com/posts/1';
const CHECK_TIMEOUT_MS = 8000;
const FAST_POLL_MS = 2500;
const FETCH_POLL_MS = 20_000;

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly ngZone = inject(NgZone);
  /** Start offline until we've done a fetch check; navigator.onLine is unreliable. */
  private online = signal(false);
  private checkInProgress = false;
  private lastNavigatorOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  readonly isOnline = computed(() => this.online());

  constructor() {
    if (typeof window === 'undefined') return;

    const update = (value: boolean) => {
      this.ngZone.run(() => this.online.set(value));
    };

    const check = () => this.fetchCheck(update);

    window.addEventListener('online', () => check());
    window.addEventListener('offline', () => update(false));

    check();

    setInterval(check, FETCH_POLL_MS);

    setInterval(() => {
      const now = navigator.onLine;
      if (now !== this.lastNavigatorOnline) {
        this.lastNavigatorOnline = now;
        if (!now) {
          update(false);
        } else {
          check();
        }
      }
    }, FAST_POLL_MS);
  }

  private async fetchCheck(update: (v: boolean) => void): Promise<void> {
    if (this.checkInProgress) return;
    this.checkInProgress = true;
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), CHECK_TIMEOUT_MS);
    try {
      const r = await fetch(CHECK_URL, { method: 'GET', signal: ac.signal, cache: 'no-store' });
      clearTimeout(timeout);
      update(r.ok);
    } catch {
      clearTimeout(timeout);
      update(false);
    } finally {
      this.checkInProgress = false;
    }
  }
}
