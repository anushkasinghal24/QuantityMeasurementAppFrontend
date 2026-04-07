import { Injectable, computed, inject } from '@angular/core';
import { ConversionHistoryService, ConversionHistoryEntry } from './conversion-history.service';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private history = inject(ConversionHistoryService);

  readonly items = computed(() => this.history.items());
  readonly total = computed(() => this.history.total());
  readonly last = computed(() => this.history.last());
  readonly isGuest = computed(() => this.history.isGuest());

  addConversion(
    entry: Omit<Extract<ConversionHistoryEntry, { kind: 'convert' }>, 'id' | 'createdAt' | 'kind'>,
  ) {
    this.history.addConversion(entry);
  }

  addComparison(
    entry: Omit<Extract<ConversionHistoryEntry, { kind: 'compare' }>, 'id' | 'createdAt' | 'kind'>,
  ) {
    this.history.addComparison(entry);
  }

  addCalculation(entry: Omit<Extract<ConversionHistoryEntry, { kind: 'calc' }>, 'id' | 'createdAt' | 'kind'>) {
    this.history.addCalculation(entry);
  }

  clear() {
    this.history.clear();
  }
}

