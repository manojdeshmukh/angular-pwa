import { Injectable } from '@angular/core';
import { FormSubmission } from '../models/form-submission.model';

const DB_NAME = 'pwa-form-db';
const STORE_NAME = 'submissions';
const DB_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class OfflineStorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        this.db = req.result;
        resolve();
      };
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async addSubmission(sub: FormSubmission): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(sub);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getPendingSubmissions(): Promise<FormSubmission[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const all = (req.result as FormSubmission[]).filter((s) => !s.synced);
        resolve(all);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getAllSubmissions(): Promise<FormSubmission[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as FormSubmission[]);
      req.onerror = () => reject(req.error);
    });
  }

  async markSynced(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const sub = getReq.result as FormSubmission;
        if (sub) {
          sub.synced = true;
          store.put(sub);
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async deleteSubmission(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
