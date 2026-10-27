import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth.page').then((module) => module.AuthPage),
  },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard('client')],
    loadComponent: () => import('./features/client/client.page').then((module) => module.ClientPage),
  },
  {
    path: 'driver',
    canActivate: [authGuard, roleGuard('driver')],
    loadComponent: () => import('./features/driver/driver.page').then((module) => module.DriverPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./features/admin/admin.page').then((module) => module.AdminPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
