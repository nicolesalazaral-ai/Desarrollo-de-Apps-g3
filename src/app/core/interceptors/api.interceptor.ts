import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular/standalone';
import { AuthStorageService } from '../storage/auth-storage.service';
import { parseApiError } from '../models/api-error';

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  const storage = inject(AuthStorageService);
  const router = inject(Router);
  const toastController = inject(ToastController);
  const token = storage.token;
  const authorized = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) return throwError(() => error);
      if (error.status === 401) {
        storage.clear();
        void router.navigate(['/login']);
      } else if ([400, 403, 404, 409].includes(error.status)) {
        const message = parseApiError(error).message ?? 'No fue posible completar la solicitud.';
        return from(toastController.create({
          message,
          duration: 3500,
          color: 'danger',
          position: 'top',
        })).pipe(
          switchMap((toast) => from(toast.present())),
          switchMap(() => throwError(() => error)),
        );
      }
      return throwError(() => error);
    }),
  );
};
