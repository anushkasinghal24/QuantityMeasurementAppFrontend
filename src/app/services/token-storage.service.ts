import { Injectable } from '@angular/core';

export interface TokenState {
  token: string | null;
  expired: boolean;
}

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly tokenKey = 'qma_token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  getTokenState(): TokenState {
    const token = this.getToken();
    if (!token) {
      return { token: null, expired: false };
    }

    if (this.isExpired(token)) {
      this.clearToken();
      return { token: null, expired: true };
    }

    return { token, expired: false };
  }

  isExpired(token: string | null = this.getToken()): boolean {
    if (!token) return false;

    const payload = this.readPayload(token);
    if (!payload || typeof payload.exp !== 'number') {
      return false;
    }

    return payload.exp * 1000 <= Date.now();
  }

  setToken(token: string, persist: 'local' | 'session' = 'local') {
    this.clearToken();
    const storage = persist === 'session' ? sessionStorage : localStorage;
    storage.setItem(this.tokenKey, token);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
  }

  private readPayload(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }
}
