import { Component, computed, inject } from '@angular/core';
import { ConversionHistoryEntry, ConversionHistoryService } from '../../core/services/conversion-history.service';
import { UnitConverterService } from '../../core/services/unit-converter.service';

@Component({
  selector: 'app-history',
  standalone: true,
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent {
  private history = inject(ConversionHistoryService);
  private units = inject(UnitConverterService);

  readonly entries = computed(() => this.history.items());
  readonly total = computed(() => this.history.total());

  clear() {
    this.history.clear();
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
    const found = this.units.categories.find(c => c.id === entry.category);
    return found?.label ?? entry.category;
  }

  formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString();
  }
}

