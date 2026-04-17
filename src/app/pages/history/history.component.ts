import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { HistoryItem } from '../../models/index';
import { getUnitLabel, UNIT_CATEGORIES } from '../../models/units';

const CAT_COLORS: Record<string, string> = {
  LENGTH: '#6366f1', WEIGHT: '#f59e0b', TEMPERATURE: '#ef4444', VOLUME: '#14b8a6', UNKNOWN: '#94a3b8',
};

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule],
  template: `
<div class="history-page">
  <div class="history-header animate-fade-in">
    <div>
      <h1 class="page-title">History</h1>
      <p class="page-sub">All your past conversions, arithmetic operations, and comparisons</p>
    </div>
    <div class="header-actions">
      <button class="view-btn" [ngClass]="{'active': view==='table'}" (click)="view='table'">📋 Table</button>
      <button class="view-btn" [ngClass]="{'active': view==='chart'}" (click)="view='chart'">📊 Charts</button>
      <button class="icon-btn" (click)="fetchHistory()" title="Refresh">↺</button>
      <button class="icon-btn danger" (click)="handleClear()" [disabled]="clearing" title="Clear all">🗑️</button>
      <button class="icon-btn" (click)="exportCsv()" title="Export CSV">⬇</button>
    </div>
  </div>

  <!-- Filters -->
  <div class="filters animate-fade-in">
    <input type="text" class="input-field search-inp" placeholder="🔍 Search history…" [(ngModel)]="search">
    <div class="filter-cats">
      <button class="filter-btn" [ngClass]="{'active': filterCat==='ALL'}" (click)="filterCat='ALL'">All</button>
      <button *ngFor="let cat of categories" class="filter-btn" [ngClass]="{'active': filterCat===cat.label.toUpperCase()}"
              (click)="filterCat=cat.label.toUpperCase()">{{cat.icon}} {{cat.label}}</button>
    </div>
  </div>

  <!-- Loading -->
  <div *ngIf="loading" class="loading-state">
    <div *ngFor="let i of [1,2,3,4,5]" class="shimmer sh-row"></div>
  </div>

  <!-- TABLE VIEW -->
  <ng-container *ngIf="!loading && view==='table'">
    <div *ngIf="filtered.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>No history found{{search ? ' matching "'+search+'"' : ''}}.</p>
    </div>

    <div *ngIf="filtered.length > 0" class="table-wrap animate-slide-up">
      <div class="hist-count">{{filtered.length}} record{{filtered.length!==1?'s':''}}{{search ? ' found' : ''}}</div>
      <div class="hist-table">
        <div class="table-header">
          <span>Operation</span><span>From</span><span>To</span><span>Result</span><span>Category</span><span>Date</span>
        </div>
        <div *ngFor="let item of filtered" class="table-row">
          <span class="op-badge">{{item.operation || 'CONVERT'}}</span>
          <span class="mono-cell">{{formatFrom(item)}}</span>
          <span class="cell-muted">{{formatTo(item)}}</span>
          <span class="result-cell mono-cell">{{item.result}}</span>
          <span class="cat-dot" [style.color]="catColor(item.measurementType)">● {{item.measurementType}}</span>
          <span class="date-cell">{{formatDate(item.createdAt)}}</span>
        </div>
      </div>
    </div>
  </ng-container>

  <!-- CHART VIEW -->
  <ng-container *ngIf="!loading && view==='chart'">
    <div class="charts-grid animate-slide-up">
      <!-- Bar chart - SVG inline -->
      <div class="card chart-card">
        <h3 class="chart-title">Activity (Last 7 Days)</h3>
        <div *ngIf="barData.length === 0" class="chart-empty">No data yet</div>
        <div *ngIf="barData.length > 0" class="bar-chart">
          <div *ngFor="let d of barData" class="bar-group">
            <div class="bar-fill" [style.height.%]="barHeight(d.count)" title="{{d.count}}"></div>
            <span class="bar-label">{{d.day}}</span>
          </div>
        </div>
      </div>

      <!-- Pie chart - CSS based -->
      <div class="card chart-card">
        <h3 class="chart-title">By Category</h3>
        <div *ngIf="pieData.length === 0" class="chart-empty">No data yet</div>
        <div *ngIf="pieData.length > 0" class="pie-legend">
          <div *ngFor="let p of pieData" class="pie-row">
            <span class="pie-dot" [style.background]="catColor(p.name)"></span>
            <span class="pie-name">{{p.name}}</span>
            <span class="pie-count">{{p.value}}</span>
            <div class="pie-bar-wrap">
              <div class="pie-bar" [style.width.%]="piePercent(p.value)" [style.background]="catColor(p.name)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ng-container>
</div>
  `,
  styles: [`
    .history-page{padding:24px;max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:20px;}
    .history-header{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;}
    .page-title{font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700;color:var(--text-primary);}
    .page-sub{font-size:0.875rem;color:var(--text-secondary);margin-top:4px;}
    .header-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
    .view-btn{display:flex;align-items:center;gap:4px;padding:7px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-secondary);color:var(--text-secondary);cursor:pointer;font-size:0.82rem;font-weight:500;font-family:inherit;transition:all 0.2s;}
    .view-btn.active{background:var(--brand-600);color:#fff;border-color:var(--brand-600);}
    .icon-btn{width:36px;height:36px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg-secondary);cursor:pointer;font-size:1rem;transition:all 0.2s;display:flex;align-items:center;justify-content:center;}
    .icon-btn:hover{background:var(--brand-50);color:var(--brand-600);}
    .icon-btn.danger:hover{background:rgba(239,68,68,0.08);color:#ef4444;}
    .filters{display:flex;flex-direction:column;gap:10px;}
    .search-inp{max-width:400px;}
    .filter-cats{display:flex;flex-wrap:wrap;gap:6px;}
    .filter-btn{padding:5px 12px;border-radius:8px;border:none;cursor:pointer;font-size:0.8rem;font-weight:500;background:var(--bg-secondary);color:var(--text-secondary);transition:all 0.2s;font-family:inherit;}
    .filter-btn.active{background:var(--brand-500);color:#fff;}
    .loading-state{display:flex;flex-direction:column;gap:8px;}
    .sh-row{height:48px;border-radius:10px;}
    .empty-state{text-align:center;padding:60px 0;color:var(--text-secondary);}
    .empty-icon{font-size:2.5rem;margin-bottom:8px;}
    .hist-count{font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;}
    .hist-table{display:flex;flex-direction:column;gap:4px;}
    .table-header{display:grid;grid-template-columns:80px 1fr 1fr 1fr 110px 120px;gap:10px;padding:8px 14px;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-secondary);font-weight:600;}
    .table-row{display:grid;grid-template-columns:80px 1fr 1fr 1fr 110px 120px;gap:10px;padding:10px 14px;background:var(--card-bg);border:1px solid var(--border);border-radius:10px;align-items:center;font-size:0.83rem;color:var(--text-primary);}
    .table-row:hover{background:var(--bg-secondary);}
    .op-badge{font-size:0.7rem;font-weight:700;color:var(--brand-600);background:var(--brand-50);padding:2px 6px;border-radius:6px;}
    .dark .op-badge{background:rgba(99,102,241,0.15);}
    .mono-cell{font-family:'JetBrains Mono',monospace;font-size:0.8rem;}
    .cell-muted{color:var(--text-secondary);}
    .result-cell{font-weight:600;color:var(--brand-600);}
    .cat-dot{font-size:0.78rem;font-weight:500;}
    .date-cell{color:var(--text-secondary);font-size:0.75rem;}
    @media(max-width:900px){.table-header,.table-row{grid-template-columns:70px 1fr 1fr 1fr;}.cat-dot,.date-cell{display:none;}}
    .charts-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px;}
    .chart-card{padding:20px;}
    .chart-title{font-family:'Space Grotesk',sans-serif;font-size:0.95rem;font-weight:600;color:var(--text-primary);margin-bottom:16px;}
    .chart-empty{color:var(--text-secondary);font-size:0.875rem;text-align:center;padding:32px 0;}
    .bar-chart{display:flex;align-items:flex-end;gap:8px;height:120px;padding-top:8px;}
    .bar-group{display:flex;flex-direction:column;align-items:center;flex:1;gap:4px;height:100%;justify-content:flex-end;}
    .bar-fill{width:100%;border-radius:6px 6px 0 0;background:linear-gradient(180deg,var(--brand-500),var(--accent-500));min-height:4px;transition:height 0.5s ease;}
    .bar-label{font-size:0.65rem;color:var(--text-secondary);text-align:center;}
    .pie-legend{display:flex;flex-direction:column;gap:10px;}
    .pie-row{display:grid;grid-template-columns:12px 80px 30px 1fr;align-items:center;gap:8px;}
    .pie-dot{width:10px;height:10px;border-radius:50%;}
    .pie-name{font-size:0.8rem;color:var(--text-primary);font-weight:500;}
    .pie-count{font-size:0.8rem;font-weight:700;color:var(--text-primary);text-align:right;}
    .pie-bar-wrap{height:6px;background:var(--border);border-radius:3px;overflow:hidden;}
    .pie-bar{height:100%;border-radius:3px;transition:width 0.5s ease;}
  `]
})
export class HistoryComponent implements OnInit {
  history: HistoryItem[] = [];
  loading = false;
  clearing = false;
  search = '';
  filterCat = 'ALL';
  view: 'table' | 'chart' = 'table';
  categories = UNIT_CATEGORIES;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() { this.fetchHistory(); }

  async fetchHistory() {
    this.loading = true;
    try {
      const data = await firstValueFrom(this.api.getMyHistory());
      this.history = Array.isArray(data) ? data : [];
    } catch { this.toast.error('Failed to load history'); }
    finally { this.loading = false; }
  }

  get filtered(): HistoryItem[] {
    return this.history.filter(item => {
      const matchCat = this.filterCat === 'ALL' || item.measurementType === this.filterCat;
      const q = this.search.toLowerCase();
      const matchSearch = !q
        || (item.operation || '').toLowerCase().includes(q)
        || (item.fromUnit || '').toLowerCase().includes(q)
        || (item.toUnit || '').toLowerCase().includes(q)
        || String(item.inputValue).includes(q)
        || String(item.value2 ?? '').includes(q)
        || String(item.result).includes(q)
        || (item.measurementType || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }

  formatFrom(item: HistoryItem): string {
    return `${item.inputValue} ${this.getLabel(item.fromUnit)}`;
  }

  formatTo(item: HistoryItem): string {
    if (item.operation === 'COMPARE') {
      return `${item.value2 ?? '—'} ${this.getLabel(item.toUnit)}`;
    }
    return this.getLabel(item.toUnit);
  }

  get barData(): { day: string; count: number }[] {
    const byDay: Record<string, number> = {};
    this.history.forEach(h => {
      if (!h.createdAt) return;
      const day = new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return Object.entries(byDay).slice(-7).map(([day, count]) => ({ day, count }));
  }

  get pieData(): { name: string; value: number }[] {
    const counts: Record<string, number> = {};
    this.history.forEach(h => { const k = h.measurementType || 'UNKNOWN'; counts[k] = (counts[k] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }

  maxBarCount(): number { return Math.max(...this.barData.map(d => d.count), 1); }
  barHeight(count: number): number { return (count / this.maxBarCount()) * 100; }
  piePercent(val: number): number { const total = this.history.length || 1; return (val / total) * 100; }

  catColor(cat?: string): string { return CAT_COLORS[cat || 'UNKNOWN'] || CAT_COLORS['UNKNOWN']; }
  getLabel(unit?: string): string { return unit ? getUnitLabel(unit) : ''; }
  formatDate(d?: string): string { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''; }

  async handleClear() {
    if (!confirm('Delete ALL your conversion history? This cannot be undone.')) return;
    this.clearing = true;
    try {
      await firstValueFrom(this.api.clearHistory());
      this.history = [];
      this.toast.success('History cleared');
    } catch { this.toast.error('Failed to clear history'); }
    finally { this.clearing = false; }
  }

  exportCsv() {
    if (this.history.length === 0) { this.toast.error('No history to export'); return; }
    const header = 'Operation,From Value,From Unit,To Value,To Unit,Result,Category,Date';
    const rows = this.history.map(h =>
      [h.operation, h.inputValue, h.fromUnit, h.value2 ?? '', h.toUnit, h.result, h.measurementType, h.createdAt].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'qma-history.csv';
    a.click();
    this.toast.success('Exported!');
  }
}
