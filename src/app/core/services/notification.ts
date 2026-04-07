import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';

export type NotificationKind = 'success' | 'info' | 'warning' | 'error';

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  message: string;
  createdAt: string;
  timeoutMs: number | null;
};

@Injectable({
  providedIn: 'root',
})
export class Notification {
  private platformId = inject(PLATFORM_ID);

  private readonly itemsSignal = signal<NotificationItem[]>([]);
  readonly items = computed(() => this.itemsSignal());

  show(kind: NotificationKind, message: string, options?: { timeoutMs?: number | null }): string {
    const id = globalThis.crypto?.randomUUID?.() ?? `n_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const timeoutMs = options?.timeoutMs ?? (kind === 'error' ? null : 3500);
    const createdAt = new Date().toISOString();

    this.itemsSignal.update(items => [{ id, kind, message, createdAt, timeoutMs }, ...items].slice(0, 5));

    if (timeoutMs != null && this.isBrowser()) {
      globalThis.setTimeout(() => this.dismiss(id), timeoutMs);
    }

    return id;
  }

  success(message: string, options?: { timeoutMs?: number | null }) {
    return this.show('success', message, options);
  }

  info(message: string, options?: { timeoutMs?: number | null }) {
    return this.show('info', message, options);
  }

  warning(message: string, options?: { timeoutMs?: number | null }) {
    return this.show('warning', message, options);
  }

  error(message: string, options?: { timeoutMs?: number | null }) {
    return this.show('error', message, options);
  }

  dismiss(id: string) {
    this.itemsSignal.update(items => items.filter(i => i.id !== id));
  }

  clear() {
    this.itemsSignal.set([]);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
