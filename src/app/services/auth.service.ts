import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/index';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('qma_token'));
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private darkModeSubject = new BehaviorSubject<boolean>(localStorage.getItem('qma_dark') === 'true');

  user$ = this.userSubject.asObservable();
  token$ = this.tokenSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  darkMode$ = this.darkModeSubject.asObservable();

  constructor(private api: ApiService) {
    this.applyDarkMode(this.darkModeSubject.value);
    this.fetchProfile(this.tokenSubject.value);
  }

  get isAuthenticated(): boolean {
    return !!this.tokenSubject.value && !!this.userSubject.value;
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
      localStorage.removeItem('qma_token');
      localStorage.removeItem('qma_username');
      localStorage.removeItem('qma_email');
      this.tokenSubject.next(null);
      this.userSubject.next(null);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async login(username: string, password: string) {
    const data = await firstValueFrom(this.api.login(username, password));
    const tok = data.token;
    localStorage.setItem('qma_token', tok);
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
    localStorage.setItem('qma_token', tok);
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
    localStorage.removeItem('qma_token');
    localStorage.removeItem('qma_username');
    localStorage.removeItem('qma_email');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  setOAuthSession(token: string, username?: string, email?: string) {
    localStorage.setItem('qma_token', token);
    if (username) localStorage.setItem('qma_username', username);
    if (email)    localStorage.setItem('qma_email', email);
    this.tokenSubject.next(token);
  }
}
