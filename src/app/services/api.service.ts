import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, HistoryItem } from '../models/index';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = `${environment.baseUrl}/api`;

  constructor(private http: HttpClient) {}

  // ✅ FIXED HEADERS METHOD
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('qma_token');

    if (!token) {
      console.warn("⛔ Token not available → request without auth");
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    console.log("✅ TOKEN USED:", token);

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // ── Auth ──────────────────────────────────────────────────
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { username, password });
  }

  register(username: string, password: string, email?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, { username, password, email });
  }

  logout(token: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/logout`, {}, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/profile`, {
      headers: this.getHeaders()
    });
  }

  // ── Quantity ──────────────────────────────────────────────
  convert(payload: { value: number; fromUnit: string; toUnit: string }): Observable<any> {
    console.log(this.http.post<any>(`${this.baseUrl}/quantity/convert`, payload, {
      headers: this.getHeaders()
    }));
    return this.http.post<any>(`${this.baseUrl}/quantity/convert`, payload, {
      headers: this.getHeaders()
    });
  }

  add(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quantity/arithmetic/add`, payload, {
      headers: this.getHeaders()
    });
  }

  subtract(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quantity/arithmetic/subtract`, payload, {
      headers: this.getHeaders()
    });
  }

  multiply(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quantity/arithmetic/multiply`, payload, {
      headers: this.getHeaders()
    });
  }

  divide(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quantity/arithmetic/divide`, payload, {
      headers: this.getHeaders()
    });
  }

  compare(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quantity/arithmetic/compare`, payload, {
      headers: this.getHeaders()
    });
  }

  // ── History ───────────────────────────────────────────────
  saveHistory(data: Partial<HistoryItem>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/history/save`, data, {
      headers: this.getHeaders()
    });
  }

  getMyHistory(): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>(`${this.baseUrl}/history/my`, {
      headers: this.getHeaders()
    });
  }

  clearHistory(): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/history/clear`, {
      headers: this.getHeaders()
    });
  }
}