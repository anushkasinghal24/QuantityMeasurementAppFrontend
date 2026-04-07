import { isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Storage as AppStorage } from './storage';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private storage = inject(AppStorage);

  private readonly storageKey = 'qma_theme';
  private readonly themeSignal = signal<Theme>('light');

  readonly theme = computed(() => this.themeSignal());
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    if (!this.isBrowser()) return;

    const stored = this.storage.getItem(this.storageKey);
    const initial = stored === 'dark' || stored === 'light' ? stored : this.prefersDark() ? 'dark' : 'light';
    this.themeSignal.set(initial);
    this.applyTheme(initial);

    effect(() => {
      const theme = this.themeSignal();
      this.applyTheme(theme);
      this.storage.setItem(this.storageKey, theme);
    });

    globalThis.addEventListener?.('storage', (e: StorageEvent) => {
      if (e.key !== this.storageKey) return;
      const next = this.storage.getItem(this.storageKey);
      if (next === 'dark' || next === 'light') this.themeSignal.set(next);
    });
  }

  toggle() {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme) {
    this.themeSignal.set(theme);
  }

  private applyTheme(theme: Theme) {
    if (!this.isBrowser()) return;
    const root = globalThis.document?.documentElement;
    if (!root) return;
    root.dataset['theme'] = theme;
    root.style.colorScheme = theme;
  }

  private prefersDark(): boolean {
    const mql = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
    return !!mql?.matches;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

