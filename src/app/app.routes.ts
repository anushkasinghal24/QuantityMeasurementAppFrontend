import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'oauth-callback', loadComponent: () => import('./pages/oauth-callback/oauth-callback.component').then(m => m.OAuthCallbackComponent) },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicOnlyGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [publicOnlyGuard]
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'history', loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent), canActivate: [authGuard] },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
    ]
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
