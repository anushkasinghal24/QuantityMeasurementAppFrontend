import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { HistoryItem } from '../../models/index';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
<div class="profile-page">
  <div class="animate-fade-in">
    <h1 class="page-title">Profile</h1>
    <p class="page-sub">Your account details and usage stats</p>
  </div>

  <!-- Profile card -->
  <div class="card profile-card animate-slide-up">
    <div class="profile-top">
      <div class="avatar-lg">
        <span>{{firstChar}}</span>
      </div>
      <div class="profile-info">
        <h2 class="profile-name">{{auth.user?.username}}</h2>
        <div class="profile-badges">
          <span class="badge role-badge">🛡️ {{auth.user?.role || 'USER'}}</span>
          <span *ngIf="isGoogle" class="badge google-badge">🌐 Google Account</span>
          <span *ngIf="!isGoogle" class="badge local-badge">🔑 Local Account</span>
        </div>
        <div *ngIf="auth.user?.email" class="profile-email">✉️ {{auth.user?.email}}</div>
        <div class="profile-joined">📅 Member since {{memberSince}}</div>
      </div>
      <button class="btn-danger logout-btn" (click)="handleLogout()">🚪 Logout</button>
    </div>
  </div>

  <!-- Stats cards -->
  <div class="stats-grid animate-slide-up">
    <div *ngFor="let s of statCards" class="card stat-card">
      <div class="stat-icon-wrap" [style.background]="s.bg">
        <span class="stat-icon">{{s.icon}}</span>
      </div>
      <div>
        <p class="stat-label">{{s.label}}</p>
        <p class="stat-value" *ngIf="!loading">{{s.value}}</p>
        <div *ngIf="loading" class="shimmer sh-val"></div>
      </div>
    </div>
  </div>

  <!-- Category breakdown -->
  <div class="card breakdown-card animate-slide-up" *ngIf="!loading && stats">
    <h3 class="card-title">Category Breakdown</h3>
    <div *ngIf="catEntries.length === 0" class="empty-msg">No conversions yet — start converting!</div>
    <div *ngIf="catEntries.length > 0" class="cat-list">
      <div *ngFor="let entry of catEntries" class="cat-row">
        <span class="cat-name">{{entry[0]}}</span>
        <div class="cat-bar-wrap">
          <div class="cat-bar" [style.width.%]="catPercent(entry[1])" [style.background]="catColors[entry[0]] || '#94a3b8'"></div>
        </div>
        <span class="cat-count">{{entry[1]}}</span>
      </div>
    </div>
  </div>

  <!-- Account info -->
  <div class="card info-card animate-slide-up">
    <h3 class="card-title">Account Details</h3>
    <div class="info-grid">
      <div class="info-row" *ngIf="auth.user?.id">
        <span class="info-label">User ID</span>
        <span class="info-val mono">{{auth.user?.id}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Provider</span>
        <span class="info-val">{{auth.user?.provider || 'local'}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Role</span>
        <span class="info-val">{{auth.user?.role || 'USER'}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Joined</span>
        <span class="info-val">{{memberSince}}</span>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .profile-page{padding:24px;max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:20px;}
    .page-title{font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700;color:var(--text-primary);}
    .page-sub{font-size:0.875rem;color:var(--text-secondary);margin-top:4px;}

    .profile-card{padding:24px;}
    .profile-top{display:flex;flex-wrap:wrap;align-items:flex-start;gap:20px;}
    .avatar-lg{width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,var(--brand-400),var(--accent-500));display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 0 6px rgba(99,102,241,0.15);}
    .avatar-lg span{color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:2rem;}
    .profile-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px;}
    .profile-name{font-family:'Space Grotesk',sans-serif;font-size:1.4rem;font-weight:700;color:var(--text-primary);}
    .profile-badges{display:flex;flex-wrap:wrap;gap:6px;}
    .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:0.73rem;font-weight:600;}
    .role-badge{background:rgba(99,102,241,0.1);color:var(--brand-600);}
    .google-badge{background:rgba(59,130,246,0.1);color:#2563eb;}
    .local-badge{background:rgba(34,197,94,0.1);color:#16a34a;}
    .profile-email,.profile-joined{font-size:0.85rem;color:var(--text-secondary);}
    .logout-btn{margin-left:auto;padding:8px 18px;font-size:0.82rem;align-self:flex-start;width:auto;}

    .stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;}
    @media(min-width:640px){.stats-grid{grid-template-columns:repeat(4,1fr);}}
    .stat-card{padding:16px;display:flex;align-items:center;gap:12px;}
    .stat-icon-wrap{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .stat-icon{font-size:1.4rem;}
    .stat-label{font-size:0.72rem;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px;}
    .stat-value{font-family:'Space Grotesk',sans-serif;font-size:1.3rem;font-weight:700;color:var(--text-primary);}
    .sh-val{height:24px;width:60px;border-radius:6px;}

    .breakdown-card,.info-card{padding:24px;}
    .card-title{font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:600;color:var(--text-primary);margin-bottom:16px;}
    .empty-msg{font-size:0.875rem;color:var(--text-secondary);text-align:center;padding:20px 0;}
    .cat-list{display:flex;flex-direction:column;gap:12px;}
    .cat-row{display:grid;grid-template-columns:100px 1fr 40px;align-items:center;gap:12px;}
    .cat-name{font-size:0.83rem;font-weight:500;color:var(--text-primary);}
    .cat-bar-wrap{height:8px;background:var(--border);border-radius:4px;overflow:hidden;}
    .cat-bar{height:100%;border-radius:4px;transition:width 0.6s ease;}
    .cat-count{font-size:0.83rem;font-weight:600;color:var(--text-primary);text-align:right;}

    .info-grid{display:flex;flex-direction:column;gap:12px;}
    .info-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);}
    .info-row:last-child{border-bottom:none;}
    .info-label{font-size:0.83rem;font-weight:600;color:var(--text-secondary);}
    .info-val{font-size:0.83rem;color:var(--text-primary);}
    .mono{font-family:'JetBrains Mono',monospace;font-size:0.75rem;}
  `]
})
export class ProfileComponent implements OnInit {
  stats: { total: number; today: number; topCat: string; categories: Record<string,number> } | null = null;
  loading = true;

  catColors: Record<string,string> = {
    LENGTH: '#6366f1', WEIGHT: '#f59e0b', TEMPERATURE: '#ef4444', VOLUME: '#14b8a6', UNKNOWN: '#94a3b8'
  };

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() { this.loadStats(); }

  async loadStats() {
    try {
      const history: HistoryItem[] = await firstValueFrom(this.api.getMyHistory());
      const arr = Array.isArray(history) ? history : [];
      const cats: Record<string,number> = arr.reduce((acc: any, h) => {
        const k = h.measurementType || 'UNKNOWN';
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {});
      const today = new Date().toDateString();
      this.stats = {
        total: arr.length,
        today: arr.filter(h => h.createdAt && new Date(h.createdAt).toDateString() === today).length,
        topCat: Object.entries(cats).sort((a,b) => b[1]-a[1])[0]?.[0] || '—',
        categories: cats,
      };
    } catch {
      this.stats = { total: 0, today: 0, topCat: '—', categories: {} };
    } finally {
      this.loading = false;
    }
  }

  get firstChar(): string { return (this.auth.user?.username || 'U')[0].toUpperCase(); }
  get isGoogle(): boolean { return this.auth.user?.provider === 'google'; }
  get memberSince(): string {
    return this.auth.user?.createdAt
      ? new Date(this.auth.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Unknown';
  }

  get statCards() {
    return [
      { icon: '⚡', label: 'Total',    value: this.stats?.total ?? 0,   bg: 'rgba(99,102,241,0.1)' },
      { icon: '🏆', label: 'Top Cat',  value: this.stats?.topCat ?? '—', bg: 'rgba(245,158,11,0.1)' },
      { icon: '📊', label: 'Today',    value: this.stats?.today ?? 0,   bg: 'rgba(20,184,166,0.1)' },
      { icon: '📅', label: 'Member Since', value: this.memberSince.split(' ')[2] || '—', bg: 'rgba(139,92,246,0.1)' },
    ];
  }

  get catEntries(): [string, number][] {
    return Object.entries(this.stats?.categories || {}).sort((a,b) => b[1]-a[1]);
  }

  catPercent(val: number): number {
    const total = this.stats?.total || 1;
    return (val / total) * 100;
  }

  async handleLogout() {
    await this.auth.logout();
    this.toast.success('Logged out');
    this.router.navigate(['/']);
  }
}
