import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { catchError, of, switchMap, timer } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import { AuthStorageService } from '../../core/storage/auth-storage.service';
import { ActiveRideResponse, ActiveTrip, Estimate, RideRequest, Trip } from '../../core/models/api.models';
import { ClientApiService } from './client-api.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { parseApiError } from '../../core/models/api-error';

type ClientTab = 'ride' | 'activity';

@Component({
  selector: 'app-client-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, EmptyStateComponent],
  templateUrl: './client.page.html',
  styleUrl: './client.page.scss',
})
export class ClientPage implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly api = inject(ClientApiService);
  private readonly authApi = inject(AuthApiService);
  readonly storage = inject(AuthStorageService);
  private readonly destroyRef = inject(DestroyRef);

  tab: ClientTab = 'ride';
  estimate?: Estimate;
  activeRide?: ActiveRideResponse;
  trips: Trip[] = [];
  loadingEstimate = false;
  loadingRequest = false;
  loadingTrips = true;
  loadingActive = true;
  errorMessage = '';
  readonly scores = [1, 2, 3, 4, 5];
  fieldErrors: Record<string, string[]> = {};
  readonly rideForm = this.fb.group({
    origin_name: ['', Validators.required],
    origin_latitude: [4.6766, [Validators.required, Validators.min(-90), Validators.max(90)]],
    origin_longitude: [-74.0483, [Validators.required, Validators.min(-180), Validators.max(180)]],
    destination_name: ['', Validators.required],
    destination_latitude: [4.6664, [Validators.required, Validators.min(-90), Validators.max(90)]],
    destination_longitude: [-74.0536, [Validators.required, Validators.min(-180), Validators.max(180)]],
  });
  readonly ratingForm = this.fb.group({
    score: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', Validators.required],
    has_incident: [false],
  });

  ngOnInit(): void {
    this.refreshTrips();
    timer(0, 5000).pipe(
      switchMap(() => this.api.active().pipe(
        catchError((error: unknown) => {
          this.errorMessage = this.messageFor(error);
          this.loadingActive = false;
          return of(undefined);
        }),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((response) => {
      if (response) {
        this.activeRide = response;
        this.loadingActive = false;
      }
    });
  }

  estimateFare(): void {
    this.fieldErrors = {};
    const form = this.rideForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    const value = form.getRawValue();
    this.loadingEstimate = true;
    this.api.estimate({
      origin_latitude: value.origin_latitude,
      origin_longitude: value.origin_longitude,
      destination_latitude: value.destination_latitude,
      destination_longitude: value.destination_longitude,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.estimate = response.estimate;
        this.loadingEstimate = false;
        this.errorMessage = '';
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  requestRide(): void {
    if (this.rideForm.invalid) {
      this.rideForm.markAllAsTouched();
      return;
    }
    this.loadingRequest = true;
    this.api.requestRide(this.rideForm.getRawValue()).pipe(
      switchMap(() => this.api.active()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => {
        this.loadingRequest = false;
        this.errorMessage = '';
        this.activeRide = response;
        this.loadingActive = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  cancelRide(id: number): void {
    this.api.cancel(id, 'Cancelado desde la aplicación').pipe(
      switchMap(() => this.api.active()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => {
        this.activeRide = response;
        this.loadingActive = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  refreshActive(): void {
    this.loadingActive = true;
    this.api.active().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.activeRide = response;
        this.loadingActive = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  refreshTrips(): void {
    this.loadingTrips = true;
    this.api.trips().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.trips = response.trips.data;
        this.loadingTrips = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  rateTrip(id: number): void {
    if (this.ratingForm.invalid) {
      this.ratingForm.markAllAsTouched();
      return;
    }
    this.api.rate(id, this.ratingForm.getRawValue()).pipe(
      switchMap((response) => {
        this.errorMessage = response.message;
        return this.api.trips();
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => {
        this.trips = response.trips.data;
        this.loadingTrips = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  logout(): void {
    this.authApi.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.storage.clear();
        window.location.assign('/login');
      },
      error: () => {
        this.storage.clear();
        window.location.assign('/login');
      },
    });
  }

  private handleError(error: unknown): void {
    this.loadingEstimate = false;
    this.loadingRequest = false;
    this.loadingTrips = false;
    this.loadingActive = false;
    this.errorMessage = this.messageFor(error);
    if (error instanceof HttpErrorResponse && error.status === 422) {
      this.fieldErrors = parseApiError(error).errors ?? {};
    }
  }

  private messageFor(error: unknown): string {
    return error instanceof HttpErrorResponse
      ? parseApiError(error).message ?? 'No fue posible obtener la información. Intenta de nuevo.'
      : 'No fue posible obtener la información. Intenta de nuevo.';
  }

  get activeData(): (RideRequest | ActiveTrip) | undefined {
    return this.activeRide?.has_active ? this.activeRide.data : undefined;
  }

  get activeTrip(): ActiveTrip | undefined {
    const data = this.activeData;
    return data && 'driver' in data ? data : undefined;
  }
}
