import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { isPlatformBrowser } from '@angular/common';

const API_BASE_URL = 'http://localhost:3000';
const TOKEN_KEY = 'marketshare_token';
const USER_KEY = 'marketshare_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal<boolean>(false);

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {
    this.isAuthenticated.set(!!this.getToken());
  }

  private canUseStorage(): boolean {
    return isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined';
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials).pipe(
      tap((res) => {
        if (res?.access_token && this.canUseStorage()) {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.isAuthenticated.set(true);
        }
      }),
    );
  }

  logout(): void {
    if (this.canUseStorage()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return this.canUseStorage() ? localStorage.getItem(TOKEN_KEY) : null;
  }

  getCurrentUser(): LoginResponse['user'] | null {
    if (!this.canUseStorage()) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginResponse['user'];
    } catch {
      return null;
    }
  }
}
