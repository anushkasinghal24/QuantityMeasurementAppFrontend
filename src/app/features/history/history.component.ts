import { Component, computed, inject } from '@angular/core';
import { ConversionHistoryEntry } from '../../core/services/conversion-history.service';
import { HistoryService } from '../../core/services/history.service';
import { Notification } from '../../core/services/notification';
import { ConverterService } from '../../core/services/converter.service';

@Component({
  selector: 'app-history',
  standalone: true,
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent {
  private history = inject(HistoryService);
  private converter = inject(ConverterService);
  private notifications = inject(Notification);

  readonly entries = computed(() => this.history.items());
  readonly total = computed(() => this.history.total());

  clear() {
    const ok = !globalThis.confirm || globalThis.confirm('Clear all saved history?');
    if (!ok) return;
    this.history.clear();
    this.notifications.success('History cleared.');
  }

  format(entry: ConversionHistoryEntry): string {
    if (entry.kind === 'convert') {
      return `${entry.value} ${entry.fromUnitId} → ${entry.result} ${entry.toUnitId}`;
    }
    if (entry.kind === 'compare') {
      return `${entry.expression} = ${entry.result ? 'TRUE' : 'FALSE'}`;
    }
    return `${entry.expression} = ${entry.result}${entry.resultUnitId ? ` ${entry.resultUnitId}` : ''}`;
  }

  formatCategory(entry: ConversionHistoryEntry): string {
    const found = this.converter.categories.find(c => c.id === entry.category);
    return found?.label ?? entry.category;
  }

  formatKind(entry: ConversionHistoryEntry): string {
    if (entry.kind === 'convert') return 'conversion';
    if (entry.kind === 'compare') return 'comparison';
    return 'arithmetic';
  }

  formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString();
  }
}

