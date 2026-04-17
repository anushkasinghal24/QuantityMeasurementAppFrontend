import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { HistoryItem } from '../../models/index';
import { getUnitLabel } from '../../models/units';

@Component({
  selector: 'app-recent-history',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
<div class="card rh-card">
  <ng-container *ngIf="loading">
    <div class="shimmer sh-title"></div>
    <div *ngFor="let i of [1,2,3]" class="shimmer sh-row"></div>
  </ng-container>

  <ng-container *ngIf="!loading">
    <div class="rh-header">
      <h3 class="rh-title">📋 Recent Activity</h3>
      <button class="view-all-btn" (click)="router.navigate(['/history'])">View all →</button>
    </div>

    <div *ngIf="items.length === 0" class="rh-empty">
      <div class="empty-icon">📭</div>
      <p>No history yet.</p>
      <p class="empty-sub">Your history will appear here.</p>
    </div>

    <div *ngIf="items.length > 0" class="rh-list">
      <div *ngFor="let item of items.slice(0, 5)" class="rh-item">
        <div class="rh-icon">🔄</div>
        <div class="rh-info">
          <p class="rh-desc">{{describe(item)}}</p>
          <p class="rh-meta">{{item.measurementType}} · {{formatDate(item.createdAt)}}</p>
        </div>
      </div>
    </div>
  </ng-container>
</div>
  `,
  styles: [`
    .rh-card{padding:20px;}
    .sh-title{height:20px;width:140px;border-radius:6px;margin-bottom:12px;}
    .sh-row{height:52px;border-radius:12px;margin-bottom:8px;}
    .rh-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
    .rh-title{font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:0.95rem;color:var(--text-primary);}
    .view-all-btn{background:none;border:none;cursor:pointer;font-size:0.78rem;color:var(--brand-600);font-weight:500;}
    .rh-empty{text-align:center;padding:32px 0;color:var(--text-secondary);}
    .empty-icon{font-size:2rem;margin-bottom:8px;}
    .rh-empty p{font-size:0.875rem;}
    .empty-sub{font-size:0.78rem;margin-top:4px;}
    .rh-list{display:flex;flex-direction:column;gap:6px;}
    .rh-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:var(--bg-secondary);transition:background 0.15s;cursor:default;}
    .rh-item:hover{background:var(--brand-50);}
    .dark .rh-item:hover{background:rgba(99,102,241,0.08);}
    .rh-icon{width:32px;height:32px;border-radius:8px;background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.9rem;}
    .rh-info{flex:1;min-width:0;}
    .rh-desc{font-size:0.82rem;font-weight:500;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .rh-meta{font-size:0.72rem;color:var(--text-secondary);margin-top:2px;}
  `]
})
export class RecentHistoryComponent {
  @Input() items: HistoryItem[] = [];
  @Input() loading = false;

  constructor(public router: Router) {}

  getLabel(unit?: string): string { return unit ? getUnitLabel(unit) : ''; }
  describe(item: HistoryItem): string {
    if (item.operation === 'COMPARE') {
      return `Compare ${item.inputValue} ${this.getLabel(item.fromUnit)} vs ${item.value2 ?? '—'} ${this.getLabel(item.toUnit)} = ${item.result}`;
    }
    return `${item.inputValue} ${this.getLabel(item.fromUnit)} → ${item.result} ${this.getLabel(item.toUnit)}`;
  }
  formatDate(d?: string): string {
    if (!d) return '';
    return new Date(d).toLocaleString();
  }
}
