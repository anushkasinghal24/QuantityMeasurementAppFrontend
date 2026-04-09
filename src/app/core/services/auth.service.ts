import { inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Storage as AppStorage } from './storage';

export type AuthSignupRequest = { email: string; password: string };
export type AuthLoginRequest = { email: string; password: string };

type StoredUser = {
  id: string;
  email: string;
  password: string;
  createdAt: string;
  name?: string;
  photoUrl?: string;
};
type JwtPayload = { sub: string; email: string; iat: number; exp: number };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private storageService = inject(AppStorage);

  private usersKey = 'qma_users';
  private tokenKey = 'qma_token';
  private userKey = 'qma_user';

  private readonly sessionSignal = signal<{ id: string; email: string; name?: string | null; photoUrl?: string | null } | null>(null);
  private readonly tokenSignal = signal<string | null>(null);

  readonly session = computed(() => this.sessionSignal());
  readonly currentUserEmail = computed(() => this.sessionSignal()?.email ?? null);
  readonly loggedIn = computed(() => validateToken(this.tokenSignal()).ok);

  constructor() {
    if (!this.isBrowser()) return;

    const storedToken = this.storageService.getItem(this.tokenKey);
    const validated = validateToken(storedToken);

    if (validated.ok) {
      this.tokenSignal.set(storedToken);
      const storedUser = this.storageService.getJson<{ id?: string; email?: string; name?: string | null; photoUrl?: string | null }>(
        this.userKey,
      );
      if (storedUser?.email && storedUser?.id) {
        this.sessionSignal.set({
          id: storedUser.id,
          email: storedUser.email,
          name: storedUser.name ?? null,
          photoUrl: storedUser.photoUrl ?? null,
        });
      } else {
        this.sessionSignal.set({ id: validated.payload.sub, email: validated.payload.email, name: null, photoUrl: null });
      }
    } else {
      this.logout();
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
        const updated = this.storageService.getJson<{ id?: string; email?: string; name?: string | null; photoUrl?: string | null }>(
          this.userKey,
        );
        if (updated?.email && updated?.id) {
          this.sessionSignal.set({
            id: updated.id,
            email: updated.email,
            name: updated.name ?? null,
            photoUrl: updated.photoUrl ?? null,
          });
        }
        else this.sessionSignal.set(null);
      }
    });
  }

  signup(request: AuthSignupRequest): { ok: true } | { ok: false; message: string } {
    if (!this.isBrowser()) return { ok: false, message: 'Signup is only available in the browser.' };

    const email = request.email.trim().toLowerCase();
    const password = request.password;
    const users = this.getUsers();

    if (users.some(u => u.email === email)) return { ok: false, message: 'An account with this email already exists.' };

    const newUser: StoredUser = {
      id: globalThis.crypto?.randomUUID?.() ?? `u_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      email, password, createdAt: new Date().toISOString()
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

    if (!found) return { ok: false, message: 'Invalid email or password.' };

    const token = this.createToken(found);
    this.storageService.setItem(this.tokenKey, token);
    this.storageService.setJson(this.userKey, { email: found.email, id: found.id, name: found.name ?? null, photoUrl: found.photoUrl ?? null });
    this.tokenSignal.set(token);
    this.sessionSignal.set({ email: found.email, id: found.id, name: found.name ?? null, photoUrl: found.photoUrl ?? null });

    return { ok: true };
  }

  logout() {
    this.storageService.removeItem(this.tokenKey);
    this.storageService.removeItem(this.userKey);
    this.tokenSignal.set(null);
    this.sessionSignal.set(null);
  }

  // Google login/signup
  loginWithGoogle(
    idToken: string,
    profile?: { name?: string | null; photoUrl?: string | null },
  ): { ok: true } | { ok: false; message: string } {
    if (!this.isBrowser()) return { ok: false, message: 'Browser required' };

    const users = this.getUsers();
    const parsed = parseGoogleIdToken(idToken);
    const emailFromToken = parsed.email;
    const nameFromToken = profile?.name ?? parsed.name ?? null;
    const photoFromToken = profile?.photoUrl ?? parsed.picture ?? null;

    if (!emailFromToken) return { ok: false, message: 'Google login failed: could not read email from the ID token.' };
    if (!parsed.sub) return { ok: false, message: 'Google login failed: invalid ID token.' };

    let user = users.find(u => u.email === emailFromToken);

    if (!user) {
      user = {
        id: crypto.randomUUID?.() ?? `u_${Date.now()}_${Math.random()}`,
        email: emailFromToken,
        password: '',
        createdAt: new Date().toISOString(),
        name: nameFromToken ?? undefined,
        photoUrl: photoFromToken ?? undefined,
      };
      users.push(user);
      this.storageService.setJson(this.usersKey, users);
    } else {
      user.name = nameFromToken ?? user.name;
      user.photoUrl = photoFromToken ?? user.photoUrl;
      this.storageService.setJson(this.usersKey, users);
    }

    const token = this.createToken(user);
    this.storageService.setItem(this.tokenKey, token);
    this.storageService.setJson(this.userKey, {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      photoUrl: user.photoUrl ?? null,
    });
    this.tokenSignal.set(token);
    this.sessionSignal.set({
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      photoUrl: user.photoUrl ?? null,
    });

    return { ok: true };
  }

  signupWithGoogle(idToken: string, profile?: { name?: string | null; photoUrl?: string | null }) {
    return this.loginWithGoogle(idToken, profile);
  }

  // Back-compat: older code called this name.
  loginOrSignupWithGoogle(idToken: string, profile?: { name?: string | null; photoUrl?: string | null }) {
    return this.loginWithGoogle(idToken, profile);
  }

  isLoggedIn(): boolean {
    const token = this.tokenSignal() ?? this.storageService.getItem(this.tokenKey);
    return validateToken(token).ok;
  }

  getCurrentUserEmail(): string | null {
    return this.currentUserEmail() ?? this.storageService.getJson<{ email?: string }>(this.userKey)?.email ?? null;
  }

  getToken(): string | null {
    const token = this.tokenSignal() ?? this.storageService.getItem(this.tokenKey);
    return validateToken(token).ok ? token : null;
  }

  private getUsers(): StoredUser[] {
    const parsed = this.storageService.getJson<StoredUser[]>(this.usersKey);
    return Array.isArray(parsed) ? parsed : [];
  }

  private createToken(user: StoredUser): string {
    const nowSec = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = { sub: user.id, email: user.email, iat: nowSec, exp: nowSec + 60 * 60 * 24 * 7 };
    const header = { alg: 'none', typ: 'JWT' } as const;
    return `${base64UrlEncodeJson(header)}.${base64UrlEncodeJson(payload)}.`;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

// ---- Helper Functions ----

function parseGoogleIdToken(idToken: string): { sub: string; email: string; name: string | null; picture: string | null } {
  const parts = idToken.split('.');
  if (parts.length < 2) return { sub: '', email: '', name: null, picture: null };

  try {
    const payloadText = base64UrlDecodeToString(parts[1]);
    if (!payloadText) return { sub: '', email: '', name: null, picture: null };

    const payload = JSON.parse(payloadText) as { sub?: string; email?: string; name?: string; picture?: string };
    return {
      sub: payload.sub ?? '',
      email: payload.email ?? '',
      name: payload.name ?? null,
      picture: payload.picture ?? null,
    };
  } catch {
    return { sub: '', email: '', name: null, picture: null };
  }
}

function validateToken(token: string | null): { ok: true; payload: JwtPayload } | { ok: false } {
  if (!token) return { ok: false };
  const parsed = parseJwtPayload(token);
  if (!parsed) return { ok: false };
  const nowSec = Math.floor(Date.now() / 1000);
  return parsed.sub && parsed.email && parsed.exp > nowSec ? { ok: true, payload: parsed } : { ok: false };
}

function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const parsed = JSON.parse(base64UrlDecodeToString(parts[1]) ?? '{}') as JwtPayload;
    return parsed.sub && parsed.email && typeof parsed.iat === 'number' && typeof parsed.exp === 'number' ? parsed : null;
  } catch { return null; }
}

function base64UrlEncodeJson(value: unknown) { return base64UrlEncodeString(JSON.stringify(value)); }
function base64UrlEncodeString(input: string) { return base64EncodeUtf8(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
function base64UrlDecodeToString(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return base64DecodeUtf8(padded);
}

function base64EncodeUtf8(input: string): string {
  if (typeof btoa === 'function') {
    const utf8 = encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
    return btoa(utf8);
  }
  const nodeBuffer = (globalThis as any).Buffer;
  return nodeBuffer?.from(input, 'utf-8').toString('base64') ?? '';
}

function base64DecodeUtf8(input: string): string | null {
  if (typeof atob === 'function') {
    try {
      const bin = atob(input);
      return decodeURIComponent(Array.from(bin).map(ch => `%${ch.charCodeAt(0).toString(16).padStart(2,'0')}`).join(''));
    } catch { return null; }
  }
  const nodeBuffer = (globalThis as any).Buffer;
  try { return nodeBuffer?.from(input, 'base64').toString('utf-8') ?? null; } catch { return null; }
}
