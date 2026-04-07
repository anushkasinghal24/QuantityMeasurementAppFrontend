import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Storage {
  private platformId = inject(PLATFORM_ID);

  isAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && !!globalThis.localStorage;
  }

  getItem(key: string): string | null {
    if (!this.isAvailable()) return null;
    return globalThis.localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (!this.isAvailable()) return;
    globalThis.localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (!this.isAvailable()) return;
    globalThis.localStorage.removeItem(key);
  }

  getJson<T>(key: string): T | null {
    const raw = this.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setJson(key: string, value: unknown): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage serialization failures
    }
  }
}
