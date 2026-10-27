import { Injectable } from '@angular/core';
import { User } from '../models/api.models';

const TOKEN_KEY = 'uber_access_token';
const USER_KEY = 'uber_user';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get user(): User | null {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch (error: unknown) {
      console.error('No se pudo leer el usuario guardado.', error);
      this.clear();
      return null;
    }
  }

  save(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
