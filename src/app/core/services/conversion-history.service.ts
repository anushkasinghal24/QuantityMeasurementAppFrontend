import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, computed, effect, signal } from '@angular/core';
import { AuthService } from './auth.service';
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

  private readonly itemsSignal = signal<ConversionHistoryEntry[]>([]);

  readonly items = computed(() => this.itemsSignal());
  readonly total = computed(() => this.itemsSignal().length);
  readonly last = computed(() => this.itemsSignal()[0] ?? null);

  constructor() {
    if (this.isBrowser()) {
      this.itemsSignal.set(this.load());
      effect(() => {
        this.save(this.itemsSignal());
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
    this.itemsSignal.update(items => [{ ...entry, id, createdAt } as ConversionHistoryEntry, ...items].slice(0, 250));
  }

  private load(): ConversionHistoryEntry[] {
    const raw = this.storage()?.getItem(this.storageKey());
    if (!raw) return [];
    const parsed = safeJsonParse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry);
  }

  private save(items: ConversionHistoryEntry[]) {
    this.storage()?.setItem(this.storageKey(), JSON.stringify(items));
  }

  private storageKey(): string {
    const email = this.auth.getCurrentUserEmail();
    if (email) return `qma_history_${email}`;
    return 'qma_history';
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private storage(): Storage | null {
    if (!this.isBrowser()) return null;
    return globalThis.localStorage ?? null;
  }
}

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
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
