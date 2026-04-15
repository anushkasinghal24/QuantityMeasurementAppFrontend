import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `
    <div class="cb-screen">
      <div class="cb-card animate-fade-in">
        <div class="cb-icon animate-pulse-slow">⚡</div>
        <div class="cb-status">
          <span class="animate-spin">⟳</span>
          Completing Google sign-in…
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cb-screen{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:var(--bg-primary);}
    .cb-card{display:flex;flex-direction:column;align-items:center;gap:16px;}
    .cb-icon{width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,var(--brand-500),var(--accent-500));display:flex;align-items:center;justify-content:center;font-size:1.5rem;box-shadow:0 0 0 8px rgba(99,102,241,0.15);}
    .cb-status{display:flex;align-items:center;gap:8px;color:var(--text-secondary);font-weight:500;}
    .animate-spin{display:inline-block;font-size:1.1rem;}
  `]
})
export class OAuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const token    = params.get('token');
    const username = params.get('username') || undefined;
    const email    = params.get('email') || undefined;

    if (token) {
      this.auth.setOAuthSession(token, username, email);
      this.toast.success('Signed in with Google! 🎉');
      window.location.href = '/dashboard';
    } else {
      this.toast.error('Google sign-in failed — please try again');
      this.router.navigate(['/login']);
    }
  }
}
