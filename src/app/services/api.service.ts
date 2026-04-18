import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, HistoryItem } from '../models/index';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private authBaseUrl = `${environment.authServiceUrl.replace(/\/$/, '')}/api`;
  private historyBaseUrl = `${environment.historyServiceUrl.replace(/\/$/, '')}/api`;
  private quantityBaseUrl = `${environment.quantityServiceUrl.replace(/\/$/, '')}/api`;

  constructor(
    private http: HttpClient,
    private tokens: TokenStorageService,
    private router: Router
  ) {}

  private getHeaders(authRequired = false): HttpHeaders | null {
    const state = this.tokens.getTokenState();

    if (state.expired) {
      this.router.navigate(['/login']);
      return null;
    }

    if (!state.token) {
      if (authRequired) {
        return null;
      }
      return new HttpHeaders({
        'Content-Type': 'application/json',
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${state.token}`,
    });
  }

  private authRequiredError() {
    return throwError(() => new Error('AUTH_REQUIRED'));
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authBaseUrl}/auth/login`, { username, password });
  }

  register(username: string, password: string, email?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authBaseUrl}/auth/register`, { username, password, email });
  }

  logout(token: string): Observable<any> {
    return this.http.post<any>(`${this.authBaseUrl}/auth/logout`, {}, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }

  getProfile(): Observable<any> {
    const headers = this.getHeaders(true);
    if (!headers) return this.authRequiredError();
    return this.http.get<any>(`${this.authBaseUrl}/auth/profile`, {
      headers,
    });
  }

  convert(payload: { value: number; fromUnit: string; toUnit: string }): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) return this.authRequiredError();
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/convert`, payload, {
      headers,
    });
  }

  add(payload: any): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) return this.authRequiredError();
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/arithmetic/add`, payload, {
      headers,
    });
  }

  subtract(payload: any): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) return this.authRequiredError();
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/arithmetic/subtract`, payload, {
      headers,
    });
  }

  multiply(payload: any): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) return this.authRequiredError();
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/arithmetic/multiply`, payload, {
      headers,
    });
  }

  divide(payload: any): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) return this.authRequiredError();
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/arithmetic/divide`, payload, {
      headers,
    });
  }

  compare(payload: any): Observable<any> {
    const headers = this.getHeaders();
    if (!headers) return this.authRequiredError();
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/arithmetic/compare`, payload, {
      headers,
    });
  }

  saveHistory(data: Partial<HistoryItem>): Observable<any> {
    const headers = this.getHeaders(true);
    if (!headers) return this.authRequiredError();
    return this.http.post<any>(`${this.historyBaseUrl}/history/save`, data, {
      headers,
    });
  }

  getMyHistory(): Observable<HistoryItem[]> {
    const headers = this.getHeaders(true);
    if (!headers) return this.authRequiredError();
    return this.http.get<HistoryItem[]>(`${this.historyBaseUrl}/history/my`, {
      headers,
    });
  }

  clearHistory(): Observable<any> {
    const headers = this.getHeaders(true);
    if (!headers) return this.authRequiredError();
    return this.http.delete<any>(`${this.historyBaseUrl}/history/clear`, {
      headers,
    });
  }
}
