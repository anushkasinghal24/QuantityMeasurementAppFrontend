import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { HistoryItem } from '../../models/index';
import { ConverterWidgetComponent } from '../../components/dashboard/converter-widget.component';
import { ArithmeticWidgetComponent } from '../../components/dashboard/arithmetic-widget.component';
import { RecentHistoryComponent } from '../../components/dashboard/recent-history.component';
import { StatsCardsComponent } from '../../components/dashboard/stats-cards.component';
import { firstValueFrom } from 'rxjs';

const TABS = [
  { id: 'convert',    label: 'Converter',  icon: '⇄' },
  { id: 'arithmetic', label: 'Arithmetic', icon: '✕' },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ConverterWidgetComponent, ArithmeticWidgetComponent, RecentHistoryComponent, StatsCardsComponent],
  template: `
<div class="dashboard">
  <!-- Header -->
  <div class="dash-header animate-fade-in">
    <h1 class="dash-title">{{greeting()}}, {{auth.user?.username || 'there'}} 👋</h1>
    <p class="dash-sub" *ngIf="auth.isAuthenticated">All calculations are saved to your history automatically.</p>
    <p class="dash-sub" *ngIf="!auth.isAuthenticated">Sign in to track your conversion &amp; calculation history.</p>
  </div>

  <!-- Stats -->
  <app-stats-cards *ngIf="auth.isAuthenticated && history.length > 0" [history]="history"></app-stats-cards>

  <!-- Tab switcher -->
  <div class="tab-bar">
    <button *ngFor="let tab of tabs" (click)="activeTab=tab.id"
            class="tab-btn" [ngClass]="{'active': activeTab===tab.id}">
      <span>{{tab.icon}}</span> {{tab.label}}
    </button>
  </div>

  <!-- Content grid -->
  <div class="content-grid" [ngClass]="{'with-sidebar': auth.isAuthenticated}">
    <div class="animate-slide-up">
      <ng-container *ngIf="activeTab==='convert'">
        <h2 class="widget-title">Unit Converter <span class="widget-sub">— results appear as you type</span></h2>
        <app-converter-widget (conversionDone)="fetchHistory()"></app-converter-widget>
      </ng-container>
      <ng-container *ngIf="activeTab==='arithmetic'">
        <h2 class="widget-title">Arithmetic Operations <span class="widget-sub">— add, subtract, multiply, divide, compare</span></h2>
        <app-arithmetic-widget (operationDone)="fetchHistory()"></app-arithmetic-widget>
      </ng-container>
    </div>

    <div *ngIf="auth.isAuthenticated" class="animate-slide-up sidebar-widget">
      <h2 class="widget-title">Recent Activity</h2>
      <app-recent-history [items]="history" [loading]="loadingHistory"></app-recent-history>
    </div>
  </div>

  <!-- Guest nudge -->
  <div *ngIf="!auth.isAuthenticated" class="guest-nudge animate-fade-in">
    <p class="nudge-icon">🔒</p>
    <h3>Track Every Calculation</h3>
    <p class="nudge-desc">Create a free account to save conversions &amp; arithmetic history, view analytics, and more.</p>
    <div class="nudge-ctas">
      <button class="btn-primary inline" (click)="router.navigate(['/register'])">Sign Up Free</button>
      <button class="btn-secondary inline" (click)="router.navigate(['/login'])">Sign In</button>
    </div>
  </div>
</div>
  `,
  styles: [`
    .dashboard{padding:24px;max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:24px;}
    .dash-title{font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700;color:var(--text-primary);}
    .dash-sub{font-size:0.875rem;color:var(--text-secondary);margin-top:4px;}
    .tab-bar{display:flex;gap:4px;background:var(--bg-secondary);padding:4px;border-radius:12px;width:fit-content;}
    .tab-btn{display:flex;align-items:center;gap:6px;padding:8px 20px;border-radius:8px;border:none;cursor:pointer;font-size:0.875rem;font-weight:600;background:transparent;color:var(--text-secondary);transition:all 0.2s;font-family:inherit;}
    .tab-btn.active{background:var(--card-bg);color:var(--brand-600);box-shadow:0 1px 4px rgba(0,0,0,0.08);}
    .content-grid{display:grid;gap:24px;}
    .content-grid.with-sidebar{grid-template-columns:1fr;}
    @media(min-width:1024px){.content-grid.with-sidebar{grid-template-columns:1fr 360px;}}
    .widget-title{font-family:'Space Grotesk',sans-serif;font-size:0.95rem;font-weight:600;color:var(--text-primary);margin-bottom:12px;}
    .widget-sub{font-size:0.8rem;font-weight:400;color:var(--text-secondary);}
    .sidebar-widget{display:flex;flex-direction:column;}
    .guest-nudge{background:var(--card-bg);border:1.5px dashed var(--border);border-radius:16px;padding:32px;text-align:center;}
    .nudge-icon{font-size:2.5rem;margin-bottom:8px;}
    .guest-nudge h3{font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:8px;}
    .nudge-desc{font-size:0.875rem;color:var(--text-secondary);margin-bottom:20px;max-width:400px;margin-left:auto;margin-right:auto;}
    .nudge-ctas{display:flex;gap:12px;justify-content:center;}
    .btn-primary.inline,.btn-secondary.inline{width:auto;padding:8px 20px;}
  `]
})
export class DashboardComponent implements OnInit {
  tabs = TABS;
  activeTab = 'convert';
  history: HistoryItem[] = [];
  loadingHistory = false;

  constructor(
    public auth: AuthService,
    public router: Router,
    private api: ApiService
  ) {}

  ngOnInit() { this.fetchHistory(); }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  async fetchHistory() {
    if (!this.auth.isAuthenticated) return;
    this.loadingHistory = true;
    try {
      const data = await firstValueFrom(this.api.getMyHistory());
      this.history = Array.isArray(data) ? data : [];
    } catch { /* silent */ }
    finally { this.loadingHistory = false; }
  }
}
