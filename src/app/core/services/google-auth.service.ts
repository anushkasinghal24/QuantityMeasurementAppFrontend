import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { AuthService } from './auth.service';

type GoogleAuthStatus = 'idle' | 'pending' | 'signed_in' | 'error';

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private auth = inject(AuthService);
  private socialAuth = isPlatformBrowser(this.platformId) ? inject(SocialAuthService) : null;

  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private lastProcessedToken: string | null = null;

  readonly status = signal<GoogleAuthStatus>('idle');
  readonly error = signal<string | null>(null);
  readonly socialUser = signal<SocialUser | null>(null);

  constructor() {
    if (!this.socialAuth) return;

    // Reset local Google auth state whenever the app logs out (token cleared).
    // This prevents stale `status === 'signed_in'` and `lastProcessedToken` from blocking future sign-in attempts.
    let wasLoggedIn = this.auth.loggedIn();
    effect(() => {
      const isLoggedIn = this.auth.loggedIn();
      if (wasLoggedIn && !isLoggedIn) {
        this.resetLocalStateAfterLogout();
        // Also sign out from the Google provider to ensure the button can issue a fresh credential on the next click
        // (and to disable auto-select in Google Identity Services).
        void this.socialAuth?.signOut().catch(() => {});
      }
      wasLoggedIn = isLoggedIn;
    });

    this.socialAuth.authState.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      this.socialUser.set(user);

      if (!user) return;
      if (!user.idToken) return this.fail('Google sign-in failed: no ID token received.');
      if (user.idToken === this.lastProcessedToken) return;

      this.lastProcessedToken = user.idToken;
      // This handles both:
      // - New user signup with Google (creates a local user entry if missing)
      // - Existing user login with Google (logs in the existing local user entry)
      const result = this.auth.loginOrSignupWithGoogle(user.idToken, {
        name: user.name ?? null,
        photoUrl: user.photoUrl ?? null,
      });
      if (!result.ok) return this.fail(result.message);

      this.clearTimer();
      this.error.set(null);
      this.status.set('signed_in');
    });
  }

  begin(timeoutMs = 12_000) {
    if (!this.socialAuth) return this.fail('Google sign-in is only available in the browser.');

    this.clearTimer();
    this.error.set(null);
    this.status.set('pending');
    // Important: after logout, Google may return the same credential quickly.
    // Clearing this allows multiple login/logout cycles without a page refresh.
    this.lastProcessedToken = null;

    this.pendingTimer = setTimeout(() => {
      if (this.status() === 'pending') this.fail('Google sign-in was cancelled, blocked, or timed out.');
    }, timeoutMs);
  }

  async signOutGoogle() {
    if (!this.socialAuth) return;
    await this.socialAuth.signOut();
    this.lastProcessedToken = null;
    this.clearTimer();
    this.status.set('idle');
    this.error.set(null);
    this.socialUser.set(null);
  }

  // Clears any in-memory state that could prevent the Google sign-in flow from working after logout.
  private resetLocalStateAfterLogout() {
    this.clearTimer();
    this.lastProcessedToken = null;
    this.status.set('idle');
    this.error.set(null);
    this.socialUser.set(null);
  }

  private fail(message: string) {
    this.clearTimer();
    this.error.set(message);
    this.status.set('error');
  }

  private clearTimer() {
    if (!this.pendingTimer) return;
    clearTimeout(this.pendingTimer);
    this.pendingTimer = null;
  }
}
