import { inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Storage as AppStorage } from './storage';

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

type JwtPayload = {
  sub: string;
  email: string;
  iat: number; // seconds
  exp: number; // seconds
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private storageService = inject(AppStorage);

  private usersKey = 'qma_users';
  private tokenKey = 'qma_token';
  private userKey = 'qma_user';

  private readonly sessionSignal = signal<{ id: string; email: string } | null>(null);
  private readonly tokenSignal = signal<string | null>(null);

  readonly session = computed(() => this.sessionSignal());
  readonly currentUserEmail = computed(() => this.sessionSignal()?.email ?? null);
  readonly loggedIn = computed(() => validateToken(this.tokenSignal()).ok);

  constructor() {
    if (this.isBrowser()) {
      const storedToken = this.storageService.getItem(this.tokenKey);
      const validated = validateToken(storedToken);
      if (validated.ok) {
        this.tokenSignal.set(storedToken);
        const storedUser = this.storageService.getJson<{ id?: string; email?: string }>(this.userKey);
        if (storedUser?.email && storedUser?.id) {
          this.sessionSignal.set({ id: storedUser.id, email: storedUser.email });
        } else {
          this.sessionSignal.set({ id: validated.payload.sub, email: validated.payload.email });
        }
      } else {
        this.storageService.removeItem(this.tokenKey);
        this.storageService.removeItem(this.userKey);
        this.tokenSignal.set(null);
        this.sessionSignal.set(null);
      }

      globalThis.addEventListener?.('storage', (e: StorageEvent) => {
        if (!e.key) return;
        if (e.key === this.tokenKey) {
          const nextToken = this.storageService.getItem(this.tokenKey);
          const nextValidated = validateToken(nextToken);
          if (nextValidated.ok) {
            this.tokenSignal.set(nextToken);
            if (!this.sessionSignal()) this.sessionSignal.set({ id: nextValidated.payload.sub, email: nextValidated.payload.email });
          } else {
            this.tokenSignal.set(null);
            this.sessionSignal.set(null);
          }
        }
        if (e.key === this.userKey) {
          const updated = this.storageService.getJson<{ id?: string; email?: string }>(this.userKey);
          if (updated?.email && updated?.id) this.sessionSignal.set({ id: updated.id, email: updated.email });
          else this.sessionSignal.set(null);
        }
      });
    }
  }

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
    this.storageService.setJson(this.usersKey, users);

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
    this.storageService.setItem(this.tokenKey, token);
    this.storageService.setJson(this.userKey, { email: found.email, id: found.id });
    this.tokenSignal.set(token);
    this.sessionSignal.set({ email: found.email, id: found.id });

    return { ok: true };
  }

  logout() {
    this.storageService.removeItem(this.tokenKey);
    this.storageService.removeItem(this.userKey);
    this.tokenSignal.set(null);
    this.sessionSignal.set(null);
  }

  isLoggedIn(): boolean {
    const token = this.tokenSignal() ?? this.storageService.getItem(this.tokenKey);
    return validateToken(token).ok;
  }

  getCurrentUserEmail(): string | null {
    const current = this.currentUserEmail();
    if (current) return current;

    const parsed = this.storageService.getJson<{ email?: string }>(this.userKey);
    if (parsed?.email) return parsed.email;

    const token = this.tokenSignal() ?? this.storageService.getItem(this.tokenKey);
    const validated = validateToken(token);
    return validated.ok ? validated.payload.email : null;
  }

  getToken(): string | null {
    const token = this.tokenSignal() ?? this.storageService.getItem(this.tokenKey);
    return validateToken(token).ok ? token : null;
  }

  private getUsers(): StoredUser[] {
    const parsed = this.storageService.getJson<StoredUser[]>(this.usersKey);
    if (!parsed || !Array.isArray(parsed)) return [];
    return parsed;
  }

  private createToken(user: StoredUser): string {
    const nowSec = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      iat: nowSec,
      exp: nowSec + 60 * 60 * 24 * 7, // 7 days
    };

    // Frontend-only demo token: JWT-shaped (base64url header + payload). No server validation.
    const header = { alg: 'none', typ: 'JWT' } as const;
    const headerPart = base64UrlEncodeJson(header);
    const payloadPart = base64UrlEncodeJson(payload);
    return `${headerPart}.${payloadPart}.`;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

function validateToken(token: string | null): { ok: true; payload: JwtPayload } | { ok: false } {
  if (!token) return { ok: false };
  const parsed = parseJwtPayload(token);
  if (!parsed) return { ok: false };
  if (!parsed.sub || !parsed.email) return { ok: false };
  const nowSec = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(parsed.exp) || parsed.exp <= nowSec) return { ok: false };
  return { ok: true, payload: parsed };
}

function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payloadPart = parts[1] ?? '';
  const payloadJson = base64UrlDecodeToString(payloadPart);
  if (!payloadJson) return null;
  try {
    const parsed = JSON.parse(payloadJson) as Partial<JwtPayload>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.sub !== 'string') return null;
    if (typeof parsed.email !== 'string') return null;
    if (typeof parsed.iat !== 'number') return null;
    if (typeof parsed.exp !== 'number') return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

function base64UrlEncodeJson(value: unknown): string {
  return base64UrlEncodeString(JSON.stringify(value));
}

function base64UrlEncodeString(input: string): string {
  const base64 = base64EncodeUtf8(input);
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecodeToString(input: string): string | null {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return base64DecodeUtf8(padded);
}

function base64EncodeUtf8(input: string): string {
  const btoaFn = (globalThis as any).btoa as ((value: string) => string) | undefined;
  if (typeof btoaFn === 'function') {
    // btoa expects Latin-1; encode to percent-escaped UTF-8 first.
    const utf8 = encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    );
    return btoaFn(utf8);
  }

  const nodeBuffer = (globalThis as any).Buffer as
    | { from: (value: string, encoding: string) => { toString: (encoding: string) => string } }
    | undefined;
  if (nodeBuffer) return nodeBuffer.from(input, 'utf-8').toString('base64');
  return '';
}

function base64DecodeUtf8(input: string): string | null {
  const atobFn = (globalThis as any).atob as ((value: string) => string) | undefined;
  if (typeof atobFn === 'function') {
    try {
      const bin = atobFn(input);
      const escaped = Array.from(bin)
        .map(ch => `%${ch.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('');
      return decodeURIComponent(escaped);
    } catch {
      return null;
    }
  }

  const nodeBuffer = (globalThis as any).Buffer as
    | { from: (value: string, encoding: string) => { toString: (encoding: string) => string } }
    | undefined;
  if (nodeBuffer) {
    try {
      return nodeBuffer.from(input, 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }
  return null;
}
