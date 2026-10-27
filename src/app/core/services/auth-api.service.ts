import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  login(input: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}${API_ENDPOINTS.auth.login}`, input);
  }

  register(input: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}${API_ENDPOINTS.auth.register}`, input);
  }

  me(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.base}${API_ENDPOINTS.auth.me}`);
  }

  logout(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.base}${API_ENDPOINTS.auth.logout}`, {});
  }

  forgotPassword(email: string, new_password: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.base}${API_ENDPOINTS.auth.forgotPassword}`,
      { email, new_password },
    );
  }
}
