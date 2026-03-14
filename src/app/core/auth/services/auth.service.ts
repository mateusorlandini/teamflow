import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {  AuthUser, LoginPayload, ROLE_PERMISSIONS, PermissionAction, PermissionResource } from '../../../domain/models/auth.model';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { environment } from '../../../../environments/environment';

const TOKEN_KEY = 'tf_access_token';
const USER_KEY = 'tf_user';
const EXPIRES_KEY = 'tf_expires_at';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<AuthUser | null>(this.loadUserFromStorage());
  private readonly _isLoading = signal(false);
  private readonly _authError = signal<string | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly authError = this._authError.asReadonly();

  readonly isAuthenticated = computed(() => this._currentUser() !== null && !this.isTokenExpired());
  readonly isAdmin = computed(() => this._currentUser()?.role === UserRole.Admin);
  readonly isManager = computed(() => [UserRole.Admin, UserRole.Manager].includes(this._currentUser()?.role ?? UserRole.Member));

  login(payload: LoginPayload): Observable<AuthUser> {
    this._isLoading.set(true);
    this._authError.set(null);

    return this.http.get<any[]>(`${environment.apiUrl}/users`).pipe(
      map((users) => {
        const user = users.find(
          (u) => u.email === payload.email && u.password === payload.password,
        );
        if (!user) {
          throw new Error('Invalid email or password.');
        }
        const authUser: AuthUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          teamIds: user.teamIds,
        };
        const fakeToken = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }));
        const expiresAt = Date.now() + 86400000;
        this.persistSession(authUser, fakeToken, expiresAt);
        return authUser;
      }),
      tap((user) => {
        this._currentUser.set(user);
        this._isLoading.set(false);
      }),
      catchError((err) => {
        this._authError.set(err.message ?? 'Authentication failed.');
        this._isLoading.set(false);
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    this.clearSession();
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(EXPIRES_KEY);
    if (!expiresAt) return true;
    return Date.now() > parseInt(expiresAt, 10);
  }

  hasPermission(resource: PermissionResource, action: PermissionAction): boolean {
    const user = this._currentUser();
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role];
    const perm = permissions.find((p) => p.resource === resource);
    return perm?.actions.includes(action) ?? false;
  }

  hasRole(role: UserRole): boolean {
    return this._currentUser()?.role === role;
  }

  refreshUser(): Observable<AuthUser | null> {
    const stored = this.loadUserFromStorage();
    if (stored) {
      this._currentUser.set(stored);
      return of(stored);
    }
    return of(null);
  }

  private persistSession(user: AuthUser, token: string, expiresAt: number): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(EXPIRES_KEY, expiresAt.toString());
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
