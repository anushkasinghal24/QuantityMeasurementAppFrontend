import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { publicOnlyGuard } from './core/guards/public-only.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },

  // Guest mode: converter is available without authentication.
  {
    path: 'converter',
    loadComponent: () =>
      import('./features/converter/converter.component').then(m => m.ConverterComponent),
  },

  {
    path: 'login',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    canActivate: [publicOnlyGuard],
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then(m => m.SignupComponent),
  },

  {
    path: 'app',
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'converter',
        loadComponent: () =>
          import('./features/converter/converter.component').then(m => m.ConverterComponent),
      },
      {
        path: 'history',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/history/history.component').then(m => m.HistoryComponent),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'app/dashboard' },
];
