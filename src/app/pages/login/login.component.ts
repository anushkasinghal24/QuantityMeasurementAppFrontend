import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgClass],
  template: `
<div class="auth-page" [class.dark]="auth.darkMode">
  <!-- Left branding panel -->
  <div class="brand-panel">
    <a routerLink="/" class="brand-logo">
      <span class="logo-icon">⚡</span> QMA
    </a>
    <div class="brand-copy">
      <h2>Convert anything.<br>Track everything.</h2>
      <p>Sign in to access your personal dashboard, history, and analytics.</p>
    </div>
    <p class="brand-footer">© 2025 QMA · Spring Boot Microservices</p>
  </div>

  <!-- Right form panel -->
  <div class="form-panel">
    <div class="form-card animate-slide-up">
      <a routerLink="/" class="mobile-logo">
        <span class="logo-icon sm">⚡</span> QMA
      </a>
      <h1>Welcome back</h1>
      <p class="form-sub">Sign in to your account</p>

      <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="form-body">
        <div class="field">
          <label class="label">Username</label>
          <input type="text" formControlName="username" class="input-field"
                 placeholder="Enter your username" autocomplete="username">
          <span *ngIf="submitted && form.controls['username'].errors?.['required']" class="field-error">Username is required</span>
        </div>

        <div class="field">
          <label class="label">Password</label>
          <div class="relative">
            <input [type]="showPassword ? 'text' : 'password'" formControlName="password"
                   class="input-field pr" placeholder="Enter your password" autocomplete="current-password">
            <button type="button" class="eye-btn" (click)="showPassword=!showPassword">
              {{showPassword ? '🙈' : '👁️'}}
            </button>
          </div>
          <span *ngIf="submitted && form.controls['password'].errors?.['required']" class="field-error">Password is required</span>
        </div>

        <button type="submit" class="btn-primary" [disabled]="loading">
          <span *ngIf="loading" class="animate-spin">⟳</span>
          {{loading ? 'Signing in…' : 'Sign In'}}
        </button>
      </form>

      <div class="divider"><span>or</span></div>

      <button class="btn-secondary google-btn" (click)="handleGoogleLogin()">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
          <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
          <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
          <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
        </svg>
        Continue with Google
      </button>

      <p class="form-footer">
        Don't have an account?
        <a routerLink="/register">Sign up free</a>
      </p>
    </div>
  </div>
</div>
  `,
  styles: [`
    .auth-page { min-height:100vh;display:flex;background:var(--bg-primary); }
    .brand-panel { display:none;flex-direction:column;justify-content:space-between;width:50%;background:linear-gradient(135deg,var(--brand-600),var(--brand-800));padding:48px;color:#fff; }
    @media(min-width:1024px){ .brand-panel{display:flex;} }
    .brand-logo { display:flex;align-items:center;gap:8px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.2rem;color:#fff;text-decoration:none; }
    .logo-icon { width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:1.1rem; }
    .logo-icon.sm { width:30px;height:30px;border-radius:10px;font-size:0.9rem; }
    .brand-copy h2 { font-family:'Space Grotesk',sans-serif;font-size:2.5rem;font-weight:700;line-height:1.2;margin-bottom:12px; }
    .brand-copy p { font-size:1.05rem;opacity:0.8;line-height:1.6; }
    .brand-footer { font-size:0.8rem;opacity:0.5; }

    .form-panel { flex:1;display:flex;align-items:center;justify-content:center;padding:40px 24px; }
    .form-card { width:100%;max-width:380px; }
    .mobile-logo { display:flex;align-items:center;gap:8px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.1rem;color:var(--text-primary);text-decoration:none;margin-bottom:28px; }
    @media(min-width:1024px){ .mobile-logo{display:none;} }
    .form-card h1 { font-family:'Space Grotesk',sans-serif;font-size:1.6rem;font-weight:700;color:var(--text-primary);margin-bottom:4px; }
    .form-sub { color:var(--text-secondary);font-size:0.9rem;margin-bottom:24px; }

    .form-body { display:flex;flex-direction:column;gap:16px; }
    .field { display:flex;flex-direction:column; }
    .field-error { font-size:0.75rem;color:#ef4444;margin-top:4px; }
    .relative { position:relative; }
    .input-field.pr { padding-right:42px; }
    .eye-btn { position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1rem; }

    .divider { display:flex;align-items:center;gap:12px;margin:20px 0; }
    .divider::before,.divider::after { content:'';flex:1;height:1px;background:var(--border); }
    .divider span { font-size:0.78rem;color:var(--text-secondary); }

    .google-btn { gap:10px;font-weight:500; }
    .form-footer { text-align:center;font-size:0.875rem;color:var(--text-secondary);margin-top:20px; }
    .form-footer a { color:var(--brand-600);font-weight:600;text-decoration:none; }
    .form-footer a:hover { text-decoration:underline; }

    .animate-spin { display:inline-block; }
  `]
})
export class LoginComponent {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  showPassword = false;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  async handleSubmit() {
    this.submitted = true;
    if (this.form.invalid) { this.toast.error('Please fill in all fields'); return; }
    this.loading = true;
    try {
      const { username, password } = this.form.value;
      await this.auth.login(username!, password!);
      this.toast.success('Welcome back! 👋');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.toast.error(err?.error?.error || err?.message || 'Login failed');
    } finally {
      this.loading = false;
    }
  }

  handleGoogleLogin() {
    let url = environment.authServiceUrl;
    if (!url.startsWith('http')) url = 'https://' + url;
    url = url.replace(/\/$/, '');
    window.location.href = url + '/oauth2/authorization/google';
  }
}
