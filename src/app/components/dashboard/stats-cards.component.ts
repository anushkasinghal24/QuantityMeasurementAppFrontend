import { Component, Input, OnChanges } from '@angular/core';
import { NgFor } from '@angular/common';
import { HistoryItem } from '../../models/index';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [NgFor],
  template: `
<div class="stats-grid">
  <div *ngFor="let card of cards" class="stat-card animate-fade-in">
    <div class="stat-icon" [style.background]="card.bg">
      <span class="stat-emoji">{{card.emoji}}</span>
    </div>
    <div class="stat-info">
      <p class="stat-label">{{card.label}}</p>
      <p class="stat-value">{{card.value}}</p>
    </div>
  </div>
</div>
  `,
  styles: [`
    .stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
    @media(min-width:1024px){.stats-grid{grid-template-columns:repeat(4,1fr);}}
    .stat-card{background:var(--card-bg);border:1px solid var(--border);border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,0.04);}
    .stat-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .stat-emoji{font-size:1.3rem;}
    .stat-label{font-size:0.72rem;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px;}
    .stat-value{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.2rem;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:120px;}
  `]
})
export class StatsCardsComponent implements OnChanges {
  @Input() history: HistoryItem[] = [];
  cards: any[] = [];

  ngOnChanges() { this.buildCards(); }

  buildCards() {
    const total = this.history.length;
    const counts: Record<string, number> = {};
    this.history.forEach(h => {
      const k = h.measurementType || 'UNKNOWN';
      counts[k] = (counts[k] || 0) + 1;
    });
    const topCat = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const today = new Date().toDateString();
    const todayCount = this.history.filter(h => h.createdAt && new Date(h.createdAt).toDateString() === today).length;
    const lastUsed = this.history[0]?.createdAt
      ? new Date(this.history[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '—';

    this.cards = [
      { emoji: '⚡', label: 'Total Conversions', value: total,       bg: 'rgba(99,102,241,0.1)' },
      { emoji: '🏆', label: 'Top Category',       value: topCat,      bg: 'rgba(245,158,11,0.1)' },
      { emoji: '📊', label: "Today's Count",      value: todayCount,  bg: 'rgba(20,184,166,0.1)' },
      { emoji: '🕐', label: 'Last Active',         value: lastUsed,    bg: 'rgba(239,68,68,0.1)' },
    ];
  }
}
