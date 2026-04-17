import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';

interface NavItem { path: string; label: string; icon: string; authRequired?: boolean; }

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass, NgIf,CommonModule],
  template: `
<div class="layout-root" [ngClass]="{'dark': authService.darkMode}">
  <!-- Mobile overlay -->
  <div *ngIf="sidebarOpen" class="mobile-overlay" (click)="sidebarOpen=false"></div>

  <!-- Sidebar -->
  <aside class="sidebar" [ngClass]="{'open': sidebarOpen}">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">⚡</div>
      <div>
        <h1 class="logo-title">QMA</h1>
        <p class="logo-sub">Measurement App</p>
      </div>
      <button class="close-btn" (click)="sidebarOpen=false">✕</button>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <ng-container *ngFor="let item of visibleNav">
        <a [routerLink]="item.path" routerLinkActive="active"
           class="sidebar-link" (click)="sidebarOpen=false">
          <span class="nav-icon">{{item.icon}}</span>
          <span>{{item.label}}</span>
          <span class="nav-arrow">›</span>
        </a>
      </ng-container>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <button class="sidebar-link" (click)="authService.toggleDark()">
        <span class="nav-icon">{{authService.darkMode ? '☀️' : '🌙'}}</span>
        <span>{{authService.darkMode ? 'Light Mode' : 'Dark Mode'}}</span>
      </button>

      <ng-container *ngIf="authService.isAuthenticated && authService.user">
        <div class="user-row">
          <div class="user-avatar">{{firstChar}}</div>
          <div class="user-info">
            <p class="user-name">{{authService.user.username}}</p>
            <p class="user-role">{{authService.user.role || 'User'}}</p>
          </div>
        </div>
        <button class="sidebar-link logout-btn" (click)="handleLogout()">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </ng-container>

      <ng-container *ngIf="!authService.isAuthenticated">
        <button class="btn-primary" (click)="router.navigate(['/login'])">Sign In</button>
      </ng-container>
    </div>
  </aside>

  <!-- Main content -->
  <div class="main-area">
    <!-- Topbar -->
    <header class="topbar">
      <button class="hamburger" (click)="sidebarOpen=true">☰</button>
      <div class="flex-1"></div>
      <button class="theme-btn" (click)="authService.toggleDark()">
        {{authService.darkMode ? '☀️' : '🌙'}}
      </button>
      <ng-container *ngIf="authService.isAuthenticated; else signInBtn">
        <div class="topbar-user">
          <div class="user-avatar sm">{{firstChar}}</div>
          <span class="topbar-username">{{authService.user?.username}}</span>
        </div>
      </ng-container>
      <ng-template #signInBtn>
        <button class="btn-primary inline" (click)="router.navigate(['/login'])">Sign In</button>
      </ng-template>
    </header>

    <!-- Page content -->
    <main class="page-content">
      <div class="page-enter">
        <router-outlet></router-outlet>
      </div>
    </main>
  </div>
</div>
  `,
  styles: [`
    .layout-root { display:flex; height:100vh; overflow:hidden; background:var(--bg-primary); }
    .mobile-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:20; }

    .sidebar {
      position:fixed;top:0;left:0;bottom:0;z-index:30;
      width:256px;display:flex;flex-direction:column;
      background:var(--sidebar-bg);border-right:1px solid var(--border);
      transform:translateX(-100%);transition:transform 0.3s ease;
    }
    .sidebar.open { transform:translateX(0); }
    @media(min-width:1024px){ .sidebar{position:static;transform:none;} }

    .sidebar-logo {
      display:flex;align-items:center;gap:12px;padding:18px 20px;
      border-bottom:1px solid var(--border);flex-shrink:0;
    }
    .logo-icon { width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,var(--brand-500),var(--accent-500));display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }
    .logo-title { font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1rem;color:var(--text-primary); }
    .logo-sub { font-size:0.72rem;color:var(--text-secondary); }
    .close-btn { margin-left:auto;background:none;border:none;cursor:pointer;color:var(--text-secondary);font-size:1.1rem;display:block; }
    @media(min-width:1024px){ .close-btn{display:none;} }

    .sidebar-nav { flex:1;padding:12px;overflow-y:auto;display:flex;flex-direction:column;gap:2px; }
    .nav-icon { font-size:1.1rem; }
    .nav-arrow { margin-left:auto;opacity:0.3;font-size:1.1rem; }
    .sidebar-footer { padding:12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:4px; }

    .user-row { display:flex;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid var(--border);margin-top:4px; }
    .user-avatar { width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,var(--brand-400),var(--accent-500));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.9rem;flex-shrink:0; }
    .user-avatar.sm { width:30px;height:30px;border-radius:8px;font-size:0.8rem; }
    .user-info .user-name { font-size:0.875rem;font-weight:600;color:var(--text-primary); }
    .user-info .user-role { font-size:0.72rem;color:var(--text-secondary); }
    .logout-btn { color:#ef4444!important; }
    .logout-btn:hover { background:rgba(239,68,68,0.08)!important;color:#dc2626!important; }

    .main-area { flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0; }
    .topbar { height:56px;display:flex;align-items:center;gap:12px;padding:0 16px;background:var(--nav-bg);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);flex-shrink:0;z-index:10; }
    .hamburger { background:none;border:none;cursor:pointer;font-size:1.2rem;color:var(--text-secondary);padding:6px;border-radius:8px; }
    @media(min-width:1024px){ .hamburger{display:none;} }
    .flex-1 { flex:1; }
    .theme-btn { background:none;border:none;cursor:pointer;font-size:1.2rem;padding:6px;border-radius:8px;transition:background 0.15s; }
    .theme-btn:hover { background:var(--bg-secondary); }
    .topbar-user { display:flex;align-items:center;gap:8px; }
    .topbar-username { font-size:0.875rem;font-weight:500;color:var(--text-primary); }
    @media(max-width:640px){ .topbar-username{display:none;} }
    .btn-primary.inline { width:auto;padding:6px 16px;font-size:0.8rem; }

    .page-content { flex:1;overflow-y:auto; }
  `]
})
export class AppLayoutComponent {
  sidebarOpen = false;
  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/history',   label: 'History',   icon: '📋', authRequired: true },
    { path: '/profile',   label: 'Profile',   icon: '👤', authRequired: true },
  ];

  constructor(
    public authService: AuthService,
    public router: Router,
    private toast: ToastService
  ) {}

  get visibleNav() {
    return this.navItems.filter(i => !i.authRequired || this.authService.isAuthenticated);
  }

  get firstChar(): string {
    return (this.authService.user?.username || 'U')[0].toUpperCase();
  }

  async handleLogout() {
    await this.authService.logout();
    this.toast.success('Logged out successfully');
    this.router.navigate(['/']);
  }
}
