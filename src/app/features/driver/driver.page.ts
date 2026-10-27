import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { catchError, from, of, switchMap, tap, timer } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import { AuthStorageService } from '../../core/storage/auth-storage.service';
import { DriverTrip, LocationUpdate, PendingRideRequest } from '../../core/models/api.models';
import { DriverApiService } from './driver-api.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { parseApiError } from '../../core/models/api-error';

@Component({
  selector: 'app-driver-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, EmptyStateComponent],
  templateUrl: './driver.page.html',
  styleUrl: './driver.page.scss',
})
export class DriverPage implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly api = inject(DriverApiService);
  private readonly authApi = inject(AuthApiService);
  readonly storage = inject(AuthStorageService);
  private readonly destroyRef = inject(DestroyRef);

  requests: PendingRideRequest[] = [];
  currentTrip?: DriverTrip;
  availability: 'available' | 'unavailable' = 'unavailable';
  loading = true;
  busy = false;
  // TODO: The API docs omit approval_status from the driver's auth/profile responses.
  approvalBlocked = false;
  errorMessage = '';
  validationErrors: Record<string, string[]> = {};
  locationMessage = '';
  readonly completeForm = this.fb.group({
    actual_distance_km: [0, [Validators.required, Validators.min(0.1)]],
    actual_duration_min: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    timer(0, 5000).pipe(
      switchMap(() => this.approvalBlocked
        ? of(undefined)
        : this.api.requests().pipe(
          catchError((error: unknown) => {
            this.setError(error);
            return of(undefined);
          }),
        )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((response) => {
      if (response) {
        this.requests = response.requests;
        this.loading = false;
      }
    });

    timer(0, 5000).pipe(
      switchMap(() => {
        const trip = this.currentTrip;
        if (this.approvalBlocked || trip?.status !== 'in_progress') return of(undefined);
        return from(this.readLocation(trip.id)).pipe(
          switchMap((location) => this.api.sendLocation(location)),
          tap(() => this.locationMessage = 'Ubicación actualizada.'),
          catchError((error: unknown) => {
            this.locationMessage = error instanceof Error ? error.message : 'No fue posible actualizar la ubicación GPS.';
            return of(undefined);
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  setAvailability(status: 'available' | 'unavailable'): void {
    if (this.approvalBlocked) return;
    this.busy = true;
    this.api.setAvailability(status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.availability = response.availability_status === 'available' ? 'available' : 'unavailable';
        this.errorMessage = response.message;
        this.busy = false;
      },
      error: (error: unknown) => this.setError(error),
    });
  }

  accept(request: PendingRideRequest): void {
    if (this.approvalBlocked) return;
    this.busy = true;
    this.api.accept(request.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.currentTrip = response.trip;
        this.requests = this.requests.filter((item) => item.id !== request.id);
        this.busy = false;
        this.errorMessage = response.message;
      },
      error: (error: unknown) => this.setError(error),
    });
  }

  advance(action: 'arrive' | 'start'): void {
    if (!this.currentTrip || this.approvalBlocked) return;
    this.busy = true;
    const operation = action === 'arrive'
      ? this.api.arrive(this.currentTrip.id)
      : this.api.start(this.currentTrip.id);
    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.currentTrip = response.trip;
        this.errorMessage = response.message;
        this.busy = false;
      },
      error: (error: unknown) => this.setError(error),
    });
  }

  completeTrip(): void {
    if (!this.currentTrip || this.completeForm.invalid || this.approvalBlocked) {
      this.completeForm.markAllAsTouched();
      return;
    }
    const value = this.completeForm.getRawValue();
    this.busy = true;
    this.api.complete(this.currentTrip.id, value.actual_distance_km, value.actual_duration_min)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.errorMessage = response.message;
          this.currentTrip = undefined;
          this.busy = false;
          this.availability = 'available';
        },
        error: (error: unknown) => this.setError(error),
      });
  }

  logout(): void {
    this.authApi.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private readLocation(tripId: number): Promise<LocationUpdate> {
    if (!navigator.geolocation) return Promise.reject(new Error('Este navegador no ofrece geolocalización.'));
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          heading: coords.heading ?? undefined,
          speed: coords.speed ?? undefined,
          trip_id: tripId,
        }),
        (error) => reject(new Error(error.message)),
        { enableHighAccuracy: true, maximumAge: 4000, timeout: 10000 },
      );
    });
  }

  private setError(error: unknown): void {
    this.busy = false;
    this.loading = false;
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    const serverMessage = error instanceof HttpErrorResponse
      ? parseApiError(error).message ?? 'No fue posible completar la operación.'
      : 'No fue posible completar la operación.';
    if (status === 403) {
      this.approvalBlocked = true;
      this.errorMessage = `${serverMessage} Tu cuenta debe estar aprobada por un administrador para operar.`;
      return;
    }
    if (error instanceof HttpErrorResponse && error.status === 422) {
      this.validationErrors = parseApiError(error).errors ?? {};
    }
    this.errorMessage = serverMessage;
  }

  private finishLogout(): void {
    this.storage.clear();
    window.location.assign('/login');
  }
}
