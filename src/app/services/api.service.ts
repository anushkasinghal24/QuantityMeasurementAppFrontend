import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, HistoryItem } from '../models/index';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private authBaseUrl = `${environment.authServiceUrl.replace(/\/$/, '')}/api`;
  private historyBaseUrl = `${environment.historyServiceUrl.replace(/\/$/, '')}/api`;
  private quantityBaseUrl = `${environment.quantityServiceUrl.replace(/\/$/, '')}/api`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('qma_token');

    if (!token) {
      console.warn('Token not available, sending request without auth');
      return new HttpHeaders({
        'Content-Type': 'application/json',
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
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
    return this.http.get<any>(`${this.authBaseUrl}/auth/profile`, {
      headers: this.getHeaders(),
    });
  }

  convert(payload: { value: number; fromUnit: string; toUnit: string }): Observable<any> {
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/convert`, payload, {
      headers: this.getHeaders(),
    });
  }

  add(payload: any): Observable<any> {
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/arithmetic/add`, payload, {
      headers: this.getHeaders(),
    });
  }

  subtract(payload: any): Observable<any> {
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/arithmetic/subtract`, payload, {
      headers: this.getHeaders(),
    });
  }

  multiply(payload: any): Observable<any> {
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/arithmetic/multiply`, payload, {
      headers: this.getHeaders(),
    });
  }

  divide(payload: any): Observable<any> {
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/arithmetic/divide`, payload, {
      headers: this.getHeaders(),
    });
  }

  compare(payload: any): Observable<any> {
    return this.http.post<any>(`${this.quantityBaseUrl}/quantity/arithmetic/compare`, payload, {
      headers: this.getHeaders(),
    });
  }

  saveHistory(data: Partial<HistoryItem>): Observable<any> {
    return this.http.post<any>(`${this.historyBaseUrl}/history/save`, data, {
      headers: this.getHeaders(),
    });
  }

  getMyHistory(): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>(`${this.historyBaseUrl}/history/my`, {
      headers: this.getHeaders(),
    });
  }

  clearHistory(): Observable<any> {
    return this.http.delete<any>(`${this.historyBaseUrl}/history/clear`, {
      headers: this.getHeaders(),
    });
  }
}
