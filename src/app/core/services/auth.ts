import { Injectable, computed, inject } from '@angular/core';
import { AuthLoginRequest, AuthService, AuthSignupRequest } from './auth.service';
import { Notification } from './notification';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private auth = inject(AuthService);
  private notifications = inject(Notification);

  readonly session = computed(() => this.auth.session());
  readonly email = computed(() => this.auth.currentUserEmail());
  readonly loggedIn = computed(() => this.auth.loggedIn());

  signup(request: AuthSignupRequest) {
    const result = this.auth.signup(request);
    if (!result.ok) this.notifications.error(result.message);
    else this.notifications.success('Account created.');
    return result;
  }

  login(request: AuthLoginRequest) {
    const result = this.auth.login(request);
    if (!result.ok) this.notifications.error(result.message);
    else this.notifications.success('Signed in.');
    return result;
  }

  logout() {
    this.auth.logout();
    this.notifications.info('Signed out.');
  }
}
