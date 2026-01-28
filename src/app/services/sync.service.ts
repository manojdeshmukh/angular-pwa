import { Injectable, inject, signal, computed } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { from, merge, timer, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { OfflineStorageService } from './offline-storage.service';
import { ConnectivityService } from './connectivity.service';
import { FormSubmission } from '../models/form-submission.model';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(OfflineStorageService);
  private readonly connectivity = inject(ConnectivityService);

  private syncing = signal(false);
  private lastSyncError = signal<string | null>(null);

  /** Emit when submissions change (e.g. after form submit). List can refresh. */
  readonly submissionsUpdated$ = new Subject<void>();

  readonly isSyncing = computed(() => this.syncing());
  readonly syncError = computed(() => this.lastSyncError());

  constructor() {
    merge(
      from(this.trySync()),
      timer(30_000, 30_000).pipe(switchMap(() => from(this.trySync())))
    ).subscribe();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.trySync());
    }
  }

  async trySync(): Promise<void> {
    if (!this.connectivity.isOnline() || this.syncing()) return;
    this.syncing.set(true);
    this.lastSyncError.set(null);
    try {
      const pending = await this.storage.getPendingSubmissions();
      for (const sub of pending) {
        const ok = await new Promise<boolean>((res) => {
          this.api.syncSubmission(sub).subscribe((success) => res(success));
        });
        if (ok) {
          await this.storage.markSynced(sub.id);
          this.submissionsUpdated$.next();
        } else {
          this.lastSyncError.set('Sync failed for some items.');
        }
      }
    } catch (e) {
      this.lastSyncError.set(e instanceof Error ? e.message : 'Sync error');
    } finally {
      this.syncing.set(false);
    }
  }

  async saveAndSync(submission: FormSubmission): Promise<boolean> {
    await this.storage.addSubmission(submission);
    this.submissionsUpdated$.next();
    if (this.connectivity.isOnline()) {
      await this.trySync();
      const pending = await this.storage.getPendingSubmissions();
      return !pending.some((s) => s.id === submission.id);
    }
    return false;
  }

  getSubmissions() {
    return from(this.storage.getAllSubmissions());
  }
}
