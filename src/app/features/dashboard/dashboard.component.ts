import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ConversionHistoryEntry, ConversionHistoryService } from '../../core/services/conversion-history.service';
import { UnitConverterService } from '../../core/services/unit-converter.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private history = inject(ConversionHistoryService);
  private units = inject(UnitConverterService);

  readonly userEmail = computed(() => this.auth.getCurrentUserEmail());
  readonly totalConversions = computed(() => this.history.total());
  readonly last = computed(() => this.history.last());

  readonly lastSummary = computed(() => {
    const entry = this.last();
    if (!entry) return 'No conversions saved yet.';
    return summarize(entry);
  });

  readonly categoriesUsed = computed(() => {
    const categories = new Set(this.history.items().map(i => i.category));
    return categories.size;
  });

  formatCategory(entry: ConversionHistoryEntry | null): string {
    if (!entry) return '';
    const found = this.units.categories.find(c => c.id === entry.category);
    return found?.label ?? entry.category;
  }
}

function summarize(entry: ConversionHistoryEntry): string {
  if (entry.kind === 'convert') return `${entry.value} ${entry.fromUnitId} → ${entry.result} ${entry.toUnitId}`;
  if (entry.kind === 'compare') return `${entry.expression} = ${entry.result ? 'TRUE' : 'FALSE'}`;
  return `${entry.expression} = ${entry.result}${entry.resultUnitId ? ` ${entry.resultUnitId}` : ''}`;
}

