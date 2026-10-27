import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { switchMap } from 'rxjs';
import { AuthApiService } from '../../core/services/auth-api.service';
import { AuthStorageService } from '../../core/storage/auth-storage.service';
import { DashboardStats, DriverProfile, Fare, UndocumentedAdminRecord } from '../../core/models/api.models';
import { AdminApiService } from './admin-api.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { parseApiError } from '../../core/models/api-error';

type AdminTab = 'dashboard' | 'drivers' | 'fares' | 'trips' | 'reports';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, EmptyStateComponent],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss',
})
export class AdminPage implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly api = inject(AdminApiService);
  private readonly authApi = inject(AuthApiService);
  readonly storage = inject(AuthStorageService);
  private readonly destroyRef = inject(DestroyRef);

  tab: AdminTab = 'dashboard';
  stats?: DashboardStats;
  recentTrips: UndocumentedAdminRecord[] = [];
  recentIncidents: UndocumentedAdminRecord[] = [];
  drivers: DriverProfile[] = [];
  faresResponse?: UndocumentedAdminRecord;
  trips?: UndocumentedAdminRecord;
  report?: UndocumentedAdminRecord;
  auditLogs?: UndocumentedAdminRecord;
  loading = false;
  errorMessage = '';
  validationErrors: Record<string, string[]> = {};
  readonly fareForm = this.fb.group({
    name: ['', Validators.required],
    base_fare: [0, [Validators.required, Validators.min(0)]],
    price_per_km: [0, [Validators.required, Validators.min(0)]],
    price_per_minute: [0, [Validators.required, Validators.min(0)]],
    minimum_fare: [0, [Validators.required, Validators.min(0)]],
    surge_multiplier: [1, [Validators.required, Validators.min(0)]],
    active: [true],
  });
  readonly filterForm = this.fb.group({
    status: [''],
    driver_id: [0],
    client_id: [0],
    date: [''],
  });
  readonly approvalForm = this.fb.group({ admin_notes: [''] });

  ngOnInit(): void {
    this.loadDashboard();
  }

  selectTab(tab: AdminTab): void {
    this.tab = tab;
    this.errorMessage = '';
    if (tab === 'dashboard') this.loadDashboard();
    if (tab === 'drivers') this.loadDrivers();
    if (tab === 'fares') this.loadFares();
    if (tab === 'trips') this.loadTrips();
    if (tab === 'reports') this.loadReports();
  }

  loadDashboard(): void {
    this.loading = true;
    this.api.dashboard().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.stats = response.stats;
        this.recentTrips = response.recent_trips;
        this.recentIncidents = response.recent_incidents;
        this.loading = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  loadDrivers(): void {
    this.loading = true;
    this.api.drivers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.drivers = response.drivers;
        this.loading = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  updateDriver(driver: DriverProfile, status: 'approved' | 'suspended' | 'rejected'): void {
    this.loading = true;
    this.api.updateDriver(driver.id, status, this.approvalForm.controls.admin_notes.value)
      .pipe(
        switchMap((response) => {
        this.errorMessage = response.message;
          return this.api.drivers();
        }),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
      next: (response) => {
        this.drivers = response.drivers;
        this.loading = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  loadFares(): void {
    this.loading = true;
    this.api.fares().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.faresResponse = response;
        this.loading = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  createFare(): void {
    if (this.fareForm.invalid) {
      this.fareForm.markAllAsTouched();
      return;
    }
    this.validationErrors = {};
    this.loading = true;
    this.api.createFare(this.fareForm.getRawValue()).pipe(
      switchMap((response) => {
        this.errorMessage = response.message;
        this.fareForm.reset({
          name: '', base_fare: 0, price_per_km: 0, price_per_minute: 0,
          minimum_fare: 0, surge_multiplier: 1, active: true,
        });
        return this.api.fares();
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => {
        this.faresResponse = response;
        this.loading = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  loadTrips(): void {
    this.loading = true;
    const values = this.filterForm.getRawValue();
    this.api.trips({
      status: values.status || undefined,
      driver_id: values.driver_id || undefined,
      client_id: values.client_id || undefined,
      date: values.date || undefined,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.trips = response;
        this.loading = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  loadReports(): void {
    this.loading = true;
    this.api.reports().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.report = response;
        this.loading = false;
      },
      error: (error: unknown) => this.handleError(error),
    });
    this.api.auditLogs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => this.auditLogs = response,
      error: (error: unknown) => this.handleError(error),
    });
  }

  logout(): void {
    this.authApi.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private handleError(error: unknown): void {
    this.loading = false;
    this.errorMessage = error instanceof HttpErrorResponse
      ? parseApiError(error).message ?? 'No fue posible cargar o guardar la información.'
      : 'No fue posible cargar o guardar la información.';
    if (error instanceof HttpErrorResponse && error.status === 422) {
      this.validationErrors = parseApiError(error).errors ?? {};
    }
  }

  private finishLogout(): void {
    this.storage.clear();
    window.location.assign('/login');
  }
}
