import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  currentUser = signal<User | null>(null);

  constructor() {
    const saved = localStorage.getItem('user');
    if (saved) this.currentUser.set(JSON.parse(saved));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/auth/register`, { name, email, password }
    );
  }

  verifyEmail(token: string) {
    return this.http.get<{ success: boolean; message: string }>(
      `${this.apiUrl}/auth/verify/${token}`
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/auth/change-password`,
      { currentPassword, newPassword }
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }
}
