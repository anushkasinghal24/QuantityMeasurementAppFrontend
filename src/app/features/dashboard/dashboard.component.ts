import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ConversionHistoryEntry } from '../../core/services/conversion-history.service';
import { ConverterService } from '../../core/services/converter.service';
import { HistoryService } from '../../core/services/history.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private history = inject(HistoryService);
  private converter = inject(ConverterService);

  readonly userEmail = computed(() => this.auth.getCurrentUserEmail());
  readonly totalOperations = computed(() => this.history.total());
  readonly last = computed(() => this.history.last());

  readonly lastSummary = computed(() => {
    const entry = this.last();
    if (!entry) return 'No conversions saved yet.';
    return summarize(entry);
  });

  readonly mostUsedCategory = computed(() => {
    const items = this.history.items();
    if (items.length === 0) return null;

    const counts = new Map<string, number>();
    for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);

    let max = 0;
    for (const count of counts.values()) max = Math.max(max, count);

    // Tie-breaker: pick the most recent category among max-count categories.
    for (const item of items) {
      if ((counts.get(item.category) ?? 0) === max) return item.category;
    }
    return items[0]!.category;
  });

  readonly mostUsedCategoryLabel = computed(() => {
    const category = this.mostUsedCategory();
    if (!category) return '—';
    const found = this.converter.categories.find(c => c.id === category);
    return found?.label ?? category;
  });

  formatCategory(entry: ConversionHistoryEntry | null): string {
    if (!entry) return '';
    const found = this.converter.categories.find(c => c.id === entry.category);
    return found?.label ?? entry.category;
  }
}

function summarize(entry: ConversionHistoryEntry): string {
  if (entry.kind === 'convert') return `${entry.value} ${entry.fromUnitId} → ${entry.result} ${entry.toUnitId}`;
  if (entry.kind === 'compare') return `${entry.expression} = ${entry.result ? 'TRUE' : 'FALSE'}`;
  return `${entry.expression} = ${entry.result}${entry.resultUnitId ? ` ${entry.resultUnitId}` : ''}`;
}

