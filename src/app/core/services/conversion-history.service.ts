import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, computed, effect, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { Storage as AppStorage } from './storage';
import { UnitCategoryId, UnitId } from './unit-converter.service';

export type HistoryEntryBase = {
  id: string;
  createdAt: string; // ISO
  category: UnitCategoryId;
};

export type ConversionHistoryEntry =
  | (HistoryEntryBase & {
      kind: 'convert';
      value: number;
      fromUnitId: UnitId;
      toUnitId: UnitId;
      result: number;
    })
  | (HistoryEntryBase & {
      kind: 'compare';
      expression: string;
      operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
      result: boolean;
    })
  | (HistoryEntryBase & {
      kind: 'calc';
      expression: string;
      result: number;
      resultUnitId: UnitId | null;
    });

@Injectable({ providedIn: 'root' })
export class ConversionHistoryService {
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);
  private storageService = inject(AppStorage);

  private readonly guestKey = 'qma_history_guest';
  private readonly legacyGuestKey = 'qma_history';
  private readonly maxItems = 250;

  private lastEmail: string | null = null;

  private readonly itemsSignal = signal<ConversionHistoryEntry[]>([]);

  readonly items = computed(() => this.itemsSignal());
  readonly total = computed(() => this.itemsSignal().length);
  readonly last = computed(() => this.itemsSignal()[0] ?? null);
  readonly isGuest = computed(() => !this.auth.currentUserEmail());

  constructor() {
    if (this.isBrowser()) {
      this.itemsSignal.set(this.loadKey(this.activeKey()));

      effect(
        () => {
          const email = this.auth.currentUserEmail();
          if (email === this.lastEmail) return;
          this.lastEmail = email;

          if (!email) {
            const mergedGuest = mergeAndSort(this.loadKey(this.guestKey), this.loadKey(this.legacyGuestKey)).slice(
              0,
              this.maxItems,
            );
            if (mergedGuest.length > 0) this.saveKey(this.guestKey, mergedGuest);
            this.storageService.removeItem(this.legacyGuestKey);
            this.itemsSignal.set(mergedGuest);
            return;
          }

          const userKey = this.userKey(email);
          const userItems = this.loadKey(userKey);
          const guestItems = mergeAndSort(this.loadKey(this.guestKey), this.loadKey(this.legacyGuestKey));

          if (guestItems.length > 0) {
            const merged = mergeAndSort(userItems, guestItems).slice(0, this.maxItems);
            this.saveKey(userKey, merged);
            this.storageService.removeItem(this.guestKey);
            this.storageService.removeItem(this.legacyGuestKey);
            this.itemsSignal.set(merged);
            return;
          }

          this.itemsSignal.set(userItems);
        },
        { allowSignalWrites: true },
      );

      effect(() => {
        this.saveKey(this.activeKey(), this.itemsSignal());
      });
    }
  }

  addConversion(
    entry: Omit<Extract<ConversionHistoryEntry, { kind: 'convert' }>, 'id' | 'createdAt' | 'kind'>
  ) {
    this.add({ ...entry, kind: 'convert' });
  }

  addComparison(
    entry: Omit<Extract<ConversionHistoryEntry, { kind: 'compare' }>, 'id' | 'createdAt' | 'kind'>
  ) {
    this.add({ ...entry, kind: 'compare' });
  }

  addCalculation(entry: Omit<Extract<ConversionHistoryEntry, { kind: 'calc' }>, 'id' | 'createdAt' | 'kind'>) {
    this.add({ ...entry, kind: 'calc' });
  }

  clear() {
    this.itemsSignal.set([]);
  }

  private add(entry: Omit<ConversionHistoryEntry, 'id' | 'createdAt'> & { kind: ConversionHistoryEntry['kind'] }) {
    const id = globalThis.crypto?.randomUUID?.() ?? `h_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const createdAt = new Date().toISOString();
    this.itemsSignal.update(items =>
      [{ ...entry, id, createdAt } as ConversionHistoryEntry, ...items].slice(0, this.maxItems),
    );
  }

  private activeKey(): string {
    const email = this.auth.currentUserEmail();
    if (email) return this.userKey(email);
    return this.guestKey;
  }

  private userKey(email: string): string {
    return `qma_history_${email}`;
  }

  private loadKey(key: string): ConversionHistoryEntry[] {
    const parsed = this.storageService.getJson<unknown[]>(key);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry);
  }

  private saveKey(key: string, items: ConversionHistoryEntry[]) {
    this.storageService.setJson(key, items);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

function mergeAndSort(a: ConversionHistoryEntry[], b: ConversionHistoryEntry[]): ConversionHistoryEntry[] {
  const byId = new Map<string, ConversionHistoryEntry>();
  for (const item of a) byId.set(item.id, item);
  for (const item of b) byId.set(item.id, item);
  return [...byId.values()].sort((x, y) => (x.createdAt < y.createdAt ? 1 : x.createdAt > y.createdAt ? -1 : 0));
}

function isHistoryEntry(value: unknown): value is ConversionHistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v['id'] !== 'string') return false;
  if (typeof v['createdAt'] !== 'string') return false;
  if (typeof v['category'] !== 'string') return false;
  if (v['kind'] === 'convert') {
    return (
      typeof v['value'] === 'number' &&
      typeof v['fromUnitId'] === 'string' &&
      typeof v['toUnitId'] === 'string' &&
      typeof v['result'] === 'number'
    );
  }
  if (v['kind'] === 'compare') {
    return typeof v['expression'] === 'string' && typeof v['operator'] === 'string' && typeof v['result'] === 'boolean';
  }
  if (v['kind'] === 'calc') {
    return typeof v['expression'] === 'string' && typeof v['result'] === 'number';
  }
  return false;
}
