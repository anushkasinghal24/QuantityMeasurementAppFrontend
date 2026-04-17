import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
<div class="nf-page">
  <div class="nf-card animate-slide-up">
    <div class="nf-code">404</div>
    <h1 class="nf-title">Page Not Found</h1>
    <p class="nf-sub">The page you're looking for doesn't exist or has been moved.</p>
    <div class="nf-actions">
      <button class="btn-primary inline" (click)="router.navigate(['/'])">Go Home</button>
      <button class="btn-secondary inline" (click)="router.navigate(['/dashboard'])">Dashboard</button>
    </div>
  </div>
</div>
  `,
  styles: [`
    .nf-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-primary);padding:24px;}
    .nf-card{text-align:center;max-width:400px;}
    .nf-code{font-family:'Space Grotesk',sans-serif;font-size:6rem;font-weight:700;background:linear-gradient(135deg,var(--brand-500),var(--accent-500));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;}
    .nf-title{font-family:'Space Grotesk',sans-serif;font-size:1.5rem;font-weight:700;color:var(--text-primary);margin:12px 0 8px;}
    .nf-sub{font-size:0.9rem;color:var(--text-secondary);line-height:1.6;margin-bottom:28px;}
    .nf-actions{display:flex;gap:12px;justify-content:center;}
    .btn-primary.inline,.btn-secondary.inline{width:auto;padding:10px 22px;}
  `]
})
export class NotFoundComponent {
  constructor(public router: Router) {}
}
