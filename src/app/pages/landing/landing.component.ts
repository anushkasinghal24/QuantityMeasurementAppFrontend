// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { NgIf } from '@angular/common';
// import { AuthService } from '../../services/auth.service';
// import { ConverterWidgetComponent } from '../../components/dashboard/converter-widget.component';

// const FEATURES = [
//   { icon: '⚡', title: 'Instant Conversion', desc: 'Real-time results as you type — no button needed.' },
//   { icon: '🔒', title: 'Secure Auth',        desc: 'JWT-based login with optional Google OAuth.' },
//   { icon: '📋', title: 'Full History',        desc: 'Every conversion tracked when you\'re signed in.' },
//   { icon: '📊', title: 'Analytics',           desc: 'Charts and stats to see your conversion patterns.' },
// ];

// @Component({
//   selector: 'app-landing',
//   standalone: true,
//   imports: [NgIf, ConverterWidgetComponent],
//   template: `
// <div class="landing" [class.dark]="auth.darkMode">
//   <!-- Nav -->
//   <nav class="landing-nav">
//     <div class="nav-inner">
//       <div class="brand"><span class="brand-icon">⚡</span> QMA</div>
//       <div class="flex-1"></div>
//       <button class="theme-btn" (click)="auth.toggleDark()">{{auth.darkMode ? '☀️' : '🌙'}}</button>
//       <ng-container *ngIf="auth.isAuthenticated; else authBtns">
//         <button class="btn-primary inline" (click)="router.navigate(['/dashboard'])">Dashboard →</button>
//       </ng-container>
//       <ng-template #authBtns>
//         <button class="btn-secondary inline" (click)="router.navigate(['/login'])">Sign In</button>
//         <button class="btn-primary inline" (click)="router.navigate(['/register'])">Get Started</button>
//       </ng-template>
//     </div>
//   </nav>

//   <div class="landing-body hero-bg">
//     <!-- Hero -->
//     <div class="hero animate-fade-in">
//       <div class="hero-badge">
//         <span class="badge-dot"></span>
//         Microservices · Spring Boot · Angular
//       </div>
//       <h1 class="hero-title">
//         Quantity Measurement<br>
//         <span class="gradient-text">&amp; Conversion App</span>
//       </h1>
//       <p class="hero-sub">
//         Convert units instantly across Length, Weight, Temperature &amp; Volume.
//         Log in to track every conversion in your personal history.
//       </p>
//       <div *ngIf="!auth.isAuthenticated" class="hero-ctas">
//         <button class="btn-primary inline" (click)="router.navigate(['/register'])">Create Free Account →</button>
//         <button class="btn-secondary inline" (click)="router.navigate(['/login'])">Sign In</button>
//       </div>
//     </div>

//     <!-- Converter preview -->
//     <div class="converter-preview animate-slide-up">
//       <div *ngIf="!auth.isAuthenticated" class="login-nudge">
//         🔒 <span>Sign in to save conversion history —</span>
//         <button (click)="router.navigate(['/login'])">Login →</button>
//       </div>
//       <app-converter-widget></app-converter-widget>
//     </div>

//     <!-- Features -->
//     <div class="features-grid">
//       <div *ngFor="let f of features" class="feature-card animate-fade-in">
//         <div class="feature-icon">{{f.icon}}</div>
//         <h3 class="feature-title">{{f.title}}</h3>
//         <p class="feature-desc">{{f.desc}}</p>
//       </div>
//     </div>
//   </div>
// </div>
//   `,
//   styles: [`
//     .landing { min-height:100vh;background:var(--bg-primary); }
//     .landing-nav { position:sticky;top:0;z-index:50;background:var(--nav-bg);backdrop-filter:blur(8px);border-bottom:1px solid var(--border); }
//     .nav-inner { max-width:1100px;margin:0 auto;padding:0 16px;height:56px;display:flex;align-items:center;gap:12px; }
//     .brand { font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.15rem;color:var(--text-primary);display:flex;align-items:center;gap:8px; }
//     .brand-icon { width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,var(--brand-500),var(--accent-500));display:inline-flex;align-items:center;justify-content:center; }
//     .flex-1{flex:1;}
//     .theme-btn{background:none;border:none;cursor:pointer;font-size:1.1rem;padding:6px;border-radius:8px;}

//     .landing-body { max-width:1100px;margin:0 auto;padding:48px 16px 80px; }

//     .hero { text-align:center;margin-bottom:48px; }
//     .hero-badge { display:inline-flex;align-items:center;gap:8px;background:var(--brand-50);color:var(--brand-600);border:1px solid var(--brand-100);border-radius:999px;padding:6px 16px;font-size:0.75rem;font-weight:600;margin-bottom:20px; }
//     .dark .hero-badge { background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.3);color:#a5b4fc; }
//     .badge-dot { width:6px;height:6px;border-radius:50%;background:var(--brand-500); animation:pulse-slow 2s infinite; }
//     .hero-title { font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(2rem,5vw,3.2rem);color:var(--text-primary);line-height:1.15;margin-bottom:16px; }
//     .hero-sub { font-size:1.05rem;color:var(--text-secondary);max-width:520px;margin:0 auto 28px;line-height:1.65; }
//     .hero-ctas { display:flex;flex-wrap:wrap;gap:12px;justify-content:center; }

//     .converter-preview { max-width:560px;margin:0 auto 64px; }
//     .login-nudge { display:flex;align-items:center;gap:8px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:10px 14px;font-size:0.85rem;color:#b45309;margin-bottom:12px; }
//     .dark .login-nudge { color:#fcd34d;background:rgba(251,191,36,0.07); }
//     .login-nudge button { margin-left:auto;background:none;border:none;cursor:pointer;font-weight:600;color:inherit;text-decoration:underline; }

//     .features-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px; }
//     .feature-card { background:var(--card-bg);border:1px solid var(--border);border-radius:16px;padding:24px;text-align:center; }
//     .feature-icon { font-size:2rem;margin-bottom:12px; }
//     .feature-title { font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1rem;color:var(--text-primary);margin-bottom:6px; }
//     .feature-desc { font-size:0.85rem;color:var(--text-secondary);line-height:1.55; }

//     .btn-primary.inline,.btn-secondary.inline { width:auto;padding:8px 20px; }
//   `]
// })
// export class LandingComponent {
//   features = FEATURES;
//   constructor(public auth: AuthService, public router: Router) {}
// }



import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common'; // ✅ FIX: NgFor added
import { AuthService } from '../../services/auth.service';
import { ConverterWidgetComponent } from '../../components/dashboard/converter-widget.component';

const FEATURES = [
  { icon: '⚡', title: 'Instant Conversion', desc: 'Real-time results as you type — no button needed.' },
  { icon: '🔒', title: 'Secure Auth',        desc: 'JWT-based login with optional Google OAuth.' },
  { icon: '📋', title: 'Full History',        desc: 'Every conversion tracked when you\'re signed in.' },
  { icon: '📊', title: 'Analytics',           desc: 'Charts and stats to see your conversion patterns.' },
];

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NgIf, NgFor, ConverterWidgetComponent], // ✅ FIX HERE
  template: `
<div class="landing" [class.dark]="auth.darkMode">
  <!-- Nav -->
  <nav class="landing-nav">
    <div class="nav-inner">
      <div class="brand"><span class="brand-icon">⚡</span> QMA</div>
      <div class="flex-1"></div>
      <button class="theme-btn" (click)="auth.toggleDark()">{{auth.darkMode ? '☀️' : '🌙'}}</button>
      <ng-container *ngIf="auth.isAuthenticated; else authBtns">
        <button class="btn-primary inline" (click)="router.navigate(['/dashboard'])">Dashboard →</button>
      </ng-container>
      <ng-template #authBtns>
        <button class="btn-secondary inline" (click)="router.navigate(['/login'])">Sign In</button>
        <button class="btn-primary inline" (click)="router.navigate(['/register'])">Get Started</button>
      </ng-template>
    </div>
  </nav>

  <div class="landing-body hero-bg">
    <!-- Hero -->
    <div class="hero animate-fade-in">
      <div class="hero-badge">
        <span class="badge-dot"></span>
        Microservices · Spring Boot · Angular
      </div>
      <h1 class="hero-title">
        Quantity Measurement<br>
        <span class="gradient-text">&amp; Conversion App</span>
      </h1>
      <p class="hero-sub">
        Convert units instantly across Length, Weight, Temperature &amp; Volume.
        Log in to track every conversion in your personal history.
      </p>
      <div *ngIf="!auth.isAuthenticated" class="hero-ctas">
        <button class="btn-primary inline" (click)="router.navigate(['/register'])">Create Free Account →</button>
        <button class="btn-secondary inline" (click)="router.navigate(['/login'])">Sign In</button>
      </div>
    </div>

    <!-- Converter preview -->
    <div class="converter-preview animate-slide-up">
      <div *ngIf="!auth.isAuthenticated" class="login-nudge">
        🔒 <span>Sign in to save conversion history —</span>
        <button (click)="router.navigate(['/login'])">Login →</button>
      </div>
      <app-converter-widget></app-converter-widget>
    </div>

    <!-- Features -->
    <div class="features-grid">
      <div *ngFor="let f of features" class="feature-card animate-fade-in">
        <div class="feature-icon">{{f.icon}}</div>
        <h3 class="feature-title">{{f.title}}</h3>
        <p class="feature-desc">{{f.desc}}</p>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .landing { min-height:100vh;background:var(--bg-primary); }
    .landing-nav { position:sticky;top:0;z-index:50;background:var(--nav-bg);backdrop-filter:blur(8px);border-bottom:1px solid var(--border); }
    .nav-inner { max-width:1100px;margin:0 auto;padding:0 16px;height:56px;display:flex;align-items:center;gap:12px; }
    .brand { font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.15rem;color:var(--text-primary);display:flex;align-items:center;gap:8px; }
    .brand-icon { width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,var(--brand-500),var(--accent-500));display:inline-flex;align-items:center;justify-content:center; }
    .flex-1{flex:1;}
    .theme-btn{background:none;border:none;cursor:pointer;font-size:1.1rem;padding:6px;border-radius:8px;}

    .landing-body { max-width:1100px;margin:0 auto;padding:48px 16px 80px; }

    .hero { text-align:center;margin-bottom:48px; }
    .hero-badge { display:inline-flex;align-items:center;gap:8px;background:var(--brand-50);color:var(--brand-600);border:1px solid var(--brand-100);border-radius:999px;padding:6px 16px;font-size:0.75rem;font-weight:600;margin-bottom:20px; }
    .dark .hero-badge { background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.3);color:#a5b4fc; }
    .badge-dot { width:6px;height:6px;border-radius:50%;background:var(--brand-500); animation:pulse-slow 2s infinite; }
    .hero-title { font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(2rem,5vw,3.2rem);color:var(--text-primary);line-height:1.15;margin-bottom:16px; }
    .hero-sub { font-size:1.05rem;color:var(--text-secondary);max-width:520px;margin:0 auto 28px;line-height:1.65; }
    .hero-ctas { display:flex;flex-wrap:wrap;gap:12px;justify-content:center; }

    .converter-preview { max-width:560px;margin:0 auto 64px; }
    .login-nudge { display:flex;align-items:center;gap:8px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:10px 14px;font-size:0.85rem;color:#b45309;margin-bottom:12px; }
    .dark .login-nudge { color:#fcd34d;background:rgba(251,191,36,0.07); }
    .login-nudge button { margin-left:auto;background:none;border:none;cursor:pointer;font-weight:600;color:inherit;text-decoration:underline; }

    .features-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px; }
    .feature-card { background:var(--card-bg);border:1px solid var(--border);border-radius:16px;padding:24px;text-align:center; }
    .feature-icon { font-size:2rem;margin-bottom:12px; }
    .feature-title { font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1rem;color:var(--text-primary);margin-bottom:6px; }
    .feature-desc { font-size:0.85rem;color:var(--text-secondary);line-height:1.55; }

    .btn-primary.inline,.btn-secondary.inline { width:auto;padding:8px 20px; }
  `]
})
export class LandingComponent {
  features = FEATURES;
  constructor(public auth: AuthService, public router: Router) {}
}