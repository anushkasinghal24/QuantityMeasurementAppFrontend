import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AuthSignupRequest = {
  email: string;
  password: string;
};

export type AuthLoginRequest = {
  email: string;
  password: string;
};

type StoredUser = {
  id: string;
  email: string;
  password: string;
  createdAt: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  private usersKey = 'qma_users';
  private tokenKey = 'qma_token';
  private userKey = 'qma_user';

  signup(request: AuthSignupRequest): { ok: true } | { ok: false; message: string } {
    if (!this.isBrowser()) return { ok: false, message: 'Signup is only available in the browser.' };

    const email = request.email.trim().toLowerCase();
    const password = request.password;

    const users = this.getUsers();
    const exists = users.some(u => u.email === email);
    if (exists) {
      return { ok: false, message: 'An account with this email already exists.' };
    }

    const newUser: StoredUser = {
      id: globalThis.crypto?.randomUUID?.() ?? `u_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.storage()?.setItem(this.usersKey, JSON.stringify(users));

    return { ok: true };
  }

  login(request: AuthLoginRequest): { ok: true } | { ok: false; message: string } {
    if (!this.isBrowser()) return { ok: false, message: 'Login is only available in the browser.' };

    const email = request.email.trim().toLowerCase();
    const password = request.password;

    const users = this.getUsers();
    const found = users.find(u => u.email === email && u.password === password);

    if (!found) {
      return { ok: false, message: 'Invalid email or password.' };
    }

    const token = this.createToken(found);
    this.storage()?.setItem(this.tokenKey, token);
    this.storage()?.setItem(this.userKey, JSON.stringify({ email: found.email, id: found.id }));

    return { ok: true };
  }

  logout() {
    this.storage()?.removeItem(this.tokenKey);
    this.storage()?.removeItem(this.userKey);
  }

  isLoggedIn(): boolean {
    return Boolean(this.storage()?.getItem(this.tokenKey));
  }

  getCurrentUserEmail(): string | null {
    try {
      const raw = this.storage()?.getItem(this.userKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { email?: string } | null;
      return parsed?.email ?? null;
    } catch {
      return null;
    }
  }

  private getUsers(): StoredUser[] {
    try {
      const raw = this.storage()?.getItem(this.usersKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as StoredUser[];
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }

  private createToken(user: StoredUser): string {
    const payload = {
      sub: user.id,
      email: user.email,
      iat: Date.now(),
    };
    const json = JSON.stringify(payload);
    if (typeof (globalThis as any).btoa === 'function') return (globalThis as any).btoa(json) as string;
    const nodeBuffer = (globalThis as any).Buffer as
      | { from: (value: string, encoding: string) => { toString: (encoding: string) => string } }
      | undefined;
    if (nodeBuffer) return nodeBuffer.from(json, 'utf-8').toString('base64');
    return json;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private storage(): Storage | null {
    if (!this.isBrowser()) return null;
    return globalThis.localStorage ?? null;
  }
}
