import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User } from '../models/index';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private darkModeSubject = new BehaviorSubject<boolean>(localStorage.getItem('qma_dark') === 'true');

  user$ = this.userSubject.asObservable();
  token$ = this.tokenSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  darkMode$ = this.darkModeSubject.asObservable();

  constructor(
    private api: ApiService,
    private tokens: TokenStorageService,
    private router: Router
  ) {
    this.applyDarkMode(this.darkModeSubject.value);
    const state = this.tokens.getTokenState();
    this.tokenSubject.next(state.token);

    if (state.expired) {
      this.router.navigate(['/login']);
      this.loadingSubject.next(false);
      return;
    }

    this.fetchProfile(state.token);
  }

  get isAuthenticated(): boolean {
    const token = this.tokenSubject.value;
    return !!token && !this.tokens.isExpired(token) && !!this.userSubject.value;
  }

  get user(): User | null { return this.userSubject.value; }
  get token(): string | null { return this.tokenSubject.value; }
  get loading(): boolean { return this.loadingSubject.value; }
  get darkMode(): boolean { return this.darkModeSubject.value; }

  private applyDarkMode(on: boolean) {
    document.documentElement.classList.toggle('dark', on);
    localStorage.setItem('qma_dark', String(on));
  }

  toggleDark() {
    const next = !this.darkModeSubject.value;
    this.darkModeSubject.next(next);
    this.applyDarkMode(next);
  }

  private async fetchProfile(tok: string | null) {
    if (!tok) { this.loadingSubject.next(false); return; }
    try {
      const data = await firstValueFrom(this.api.getProfile());
      const cachedUsername = localStorage.getItem('qma_username') || '';
      const cachedEmail    = localStorage.getItem('qma_email') || '';
      this.userSubject.next({
        ...data,
        username: data.username || cachedUsername,
        email:    data.email    || cachedEmail,
      });
    } catch {
      this.tokens.clearToken();
      localStorage.removeItem('qma_username');
      localStorage.removeItem('qma_email');
      this.tokenSubject.next(null);
      this.userSubject.next(null);
      this.router.navigate(['/login']);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async login(username: string, password: string) {
    const data = await firstValueFrom(this.api.login(username, password));
    const tok = data.token;
    this.tokens.setToken(tok);
    localStorage.removeItem('qma_username');
    localStorage.removeItem('qma_email');
    this.tokenSubject.next(tok);
    this.userSubject.next({
      username: data.username || username,
      email:    data.email    || '',
      role:     data.role     || 'USER',
      provider: data.provider || 'local',
      id:       data.id,
      createdAt: data.createdAt,
    });
    return data;
  }

  async register(username: string, password: string, email?: string) {
    const data = await firstValueFrom(this.api.register(username, password, email));
    const tok = data.token;
    this.tokens.setToken(tok);
    this.tokenSubject.next(tok);
    this.userSubject.next({
      username: data.username || username,
      email:    data.email    || email || '',
      role:     data.role     || 'USER',
      provider: 'local',
      id:       data.id,
      createdAt: data.createdAt,
    });
    return data;
  }

  async logout() {
    const tok = this.tokenSubject.value;
    if (tok) {
      try { await firstValueFrom(this.api.logout(tok)); } catch { /* ignore */ }
    }
    this.tokens.clearToken();
    localStorage.removeItem('qma_username');
    localStorage.removeItem('qma_email');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  setOAuthSession(token: string, username?: string, email?: string) {
    this.tokens.setToken(token);
    if (username) localStorage.setItem('qma_username', username);
    if (email)    localStorage.setItem('qma_email', email);
    this.tokenSubject.next(token);
    this.userSubject.next({
      username: username || localStorage.getItem('qma_username') || '',
      email: email || localStorage.getItem('qma_email') || '',
      role: 'USER',
      provider: 'google',
    });
  }
}
