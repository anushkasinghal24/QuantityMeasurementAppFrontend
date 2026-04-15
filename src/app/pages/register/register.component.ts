import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';

const PERKS = [
  'Save unlimited conversion & arithmetic history',
  'Personal dashboard & analytics charts',
  'Google OAuth login supported',
  'Completely free forever',
];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgFor, NgClass],
  template: `
<div class="auth-page" [class.dark]="auth.darkMode">
  <div class="brand-panel">
    <a routerLink="/" class="brand-logo"><span class="logo-icon">⚡</span> QMA</a>
    <div class="brand-copy">
      <h2>Start measuring.<br>Start tracking.</h2>
      <ul class="perks">
        <li *ngFor="let p of perks"><span class="check">✓</span>{{p}}</li>
      </ul>
    </div>
    <p class="brand-footer">© 2025 QMA · Spring Boot Microservices</p>
  </div>

  <div class="form-panel">
    <div class="form-card animate-slide-up">
      <a routerLink="/" class="mobile-logo"><span class="logo-icon sm">⚡</span> QMA</a>
      <h1>Create account</h1>
      <p class="form-sub">Join QMA — it's free</p>

      <form [formGroup]="form" (ngSubmit)="handleSubmit()" class="form-body">
        <div class="field">
          <label class="label">Username <span class="req">*</span></label>
          <input type="text" formControlName="username" class="input-field" placeholder="Choose a username" autocomplete="username">
          <span *ngIf="submitted && f['username'].errors?.['required']" class="field-error">Username is required</span>
        </div>

        <div class="field">
          <label class="label">Email <span class="opt">(optional)</span></label>
          <input type="email" formControlName="email" class="input-field" placeholder="you@example.com" autocomplete="email">
        </div>

        <div class="field">
          <label class="label">Password <span class="req">*</span></label>
          <div class="relative">
            <input [type]="showPw ? 'text' : 'password'" formControlName="password"
                   class="input-field pr" placeholder="At least 6 characters" autocomplete="new-password">
            <button type="button" class="eye-btn" (click)="showPw=!showPw">{{showPw ? '🙈' : '👁️'}}</button>
          </div>
          <div *ngIf="form.value.password" class="strength-bar">
            <div class="bars">
              <div *ngFor="let i of [1,2,3,4,5]" class="bar"
                   [ngClass]="{'filled': i <= pwStrength, 'weak': pwStrength<=1, 'fair': pwStrength===2||pwStrength===3, 'strong': pwStrength>=4}"></div>
            </div>
            <span [class]="strengthColor">{{strengthLabel}}</span>
          </div>
          <span *ngIf="submitted && f['password'].errors?.['minlength']" class="field-error">Min 6 characters</span>
        </div>

        <div class="field">
          <label class="label">Confirm Password <span class="req">*</span></label>
          <input type="password" formControlName="confirm" class="input-field" placeholder="Repeat your password" autocomplete="new-password"
                 [class.mismatch]="form.value.confirm && form.value.confirm !== form.value.password">
          <span *ngIf="form.value.confirm && form.value.confirm !== form.value.password" class="field-error">Passwords do not match</span>
        </div>

        <button type="submit" class="btn-primary" [disabled]="loading">
          <span *ngIf="loading" class="animate-spin">⟳</span>
          {{loading ? 'Creating account…' : 'Create Account'}}
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
      <p class="form-footer">Already have an account? <a routerLink="/login">Sign in</a></p>
    </div>
  </div>
</div>
  `,
  styles: [`
    .auth-page{min-height:100vh;display:flex;background:var(--bg-primary);}
    .brand-panel{display:none;flex-direction:column;justify-content:space-between;width:50%;background:linear-gradient(135deg,#7c3aed,var(--brand-700));padding:48px;color:#fff;}
    @media(min-width:1024px){.brand-panel{display:flex;}}
    .brand-logo{display:flex;align-items:center;gap:8px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.2rem;color:#fff;text-decoration:none;}
    .logo-icon{width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:1.1rem;}
    .logo-icon.sm{width:30px;height:30px;border-radius:10px;font-size:0.9rem;}
    .brand-copy h2{font-family:'Space Grotesk',sans-serif;font-size:2.4rem;font-weight:700;line-height:1.2;margin-bottom:24px;}
    .perks{list-style:none;display:flex;flex-direction:column;gap:12px;}
    .perks li{display:flex;align-items:center;gap:10px;font-size:0.95rem;opacity:0.9;}
    .check{width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,0.2);display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;flex-shrink:0;}
    .brand-footer{font-size:0.8rem;opacity:0.5;}
    .form-panel{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 24px;}
    .form-card{width:100%;max-width:380px;}
    .mobile-logo{display:flex;align-items:center;gap:8px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.1rem;color:var(--text-primary);text-decoration:none;margin-bottom:28px;}
    @media(min-width:1024px){.mobile-logo{display:none;}}
    .form-card h1{font-family:'Space Grotesk',sans-serif;font-size:1.6rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;}
    .form-sub{color:var(--text-secondary);font-size:0.9rem;margin-bottom:24px;}
    .form-body{display:flex;flex-direction:column;gap:14px;}
    .field{display:flex;flex-direction:column;}
    .req{color:#ef4444;}
    .opt{font-size:0.72rem;color:var(--text-secondary);font-weight:400;}
    .field-error{font-size:0.75rem;color:#ef4444;margin-top:4px;}
    .relative{position:relative;}
    .input-field.pr{padding-right:42px;}
    .input-field.mismatch{border-color:#ef4444;box-shadow:0 0 0 2px rgba(239,68,68,0.2);}
    .eye-btn{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1rem;}
    .strength-bar{margin-top:8px;display:flex;flex-direction:column;gap:4px;}
    .bars{display:flex;gap:4px;}
    .bar{flex:1;height:4px;border-radius:2px;background:var(--border);transition:background 0.3s;}
    .bar.filled.weak{background:#ef4444;}
    .bar.filled.fair{background:#f59e0b;}
    .bar.filled.strong{background:#22c55e;}
    .strength-bar span{font-size:0.73rem;}
    .weak-text{color:#ef4444;} .fair-text{color:#f59e0b;} .strong-text{color:#22c55e;}
    .divider{display:flex;align-items:center;gap:12px;margin:20px 0;}
    .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--border);}
    .divider span{font-size:0.78rem;color:var(--text-secondary);}
    .google-btn{gap:10px;font-weight:500;}
    .form-footer{text-align:center;font-size:0.875rem;color:var(--text-secondary);margin-top:20px;}
    .form-footer a{color:var(--brand-600);font-weight:600;text-decoration:none;}
    .form-footer a:hover{text-decoration:underline;}
    .animate-spin{display:inline-block;}
  `]
})
export class RegisterComponent {
  perks = PERKS;
  form = this.fb.group({
    username: ['', Validators.required],
    email: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  });
  showPw = false;
  loading = false;
  submitted = false;

  get f() { return this.form.controls; }

  get pwStrength(): number {
    const p = this.form.value.password || '';
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  }
  get strengthLabel(): string { return ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][this.pwStrength]; }
  get strengthColor(): string { return ['', 'weak-text', 'fair-text', 'fair-text', 'strong-text', 'strong-text'][this.pwStrength]; }

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  async handleSubmit() {
    this.submitted = true;
    const { username, password, confirm, email } = this.form.value;
    if (!username?.trim()) { this.toast.error('Username is required'); return; }
    if ((password?.length ?? 0) < 6) { this.toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirm) { this.toast.error('Passwords do not match'); return; }
    this.loading = true;
    try {
      await this.auth.register(username!, password!, email || undefined);
      this.toast.success('Account created! Welcome 🎉');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.toast.error(err?.error?.error || err?.message || 'Registration failed');
    } finally {
      this.loading = false;
    }
  }

  handleGoogleLogin() {
    let url = environment.authServiceUrl;
    if (!url.startsWith('http')) url = 'https://' + url;
    window.location.href = url.replace(/\/$/, '') + '/oauth2/authorization/google';
  }
}
