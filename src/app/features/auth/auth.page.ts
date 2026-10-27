import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';
import { RegisterRequest } from '../../core/models/api.models';
import { parseApiError } from '../../core/models/api-error';
import { AuthStorageService } from '../../core/storage/auth-storage.service';

type AuthMode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterLink],
  templateUrl: './auth.page.html',
  styleUrl: './auth.page.scss',
})
export class AuthPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthApiService);
  private readonly storage = inject(AuthStorageService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  mode: AuthMode = 'login';
  loading = false;
  serverMessage = '';
  validationErrors: Record<string, string[]> = {};
  readonly form = this.fb.group({
    login: ['', [Validators.required]],
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['client' as 'client' | 'driver', [Validators.required]],
    license_number: [''],
    plate: [''],
    brand: [''],
    model: [''],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    capacity: [4, [Validators.required, Validators.min(1)]],
    color: [''],
  });
  readonly driverFields = [
    { name: 'license_number', label: 'Número de licencia', type: 'text', placeholder: 'LC-88291-CO' },
    { name: 'plate', label: 'Placa', type: 'text', placeholder: 'HJK-987' },
    { name: 'brand', label: 'Marca', type: 'text', placeholder: 'Mazda' },
    { name: 'model', label: 'Modelo', type: 'text', placeholder: 'Mazda 3' },
    { name: 'year', label: 'Año', type: 'number', placeholder: '2024' },
    { name: 'capacity', label: 'Capacidad', type: 'number', placeholder: '4' },
    { name: 'color', label: 'Color', type: 'text', placeholder: 'Rojo' },
  ] as const;

  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.serverMessage = '';
    this.validationErrors = {};
  }

  submit(): void {
    this.serverMessage = '';
    this.validationErrors = {};
    if (this.mode === 'login') {
      const login = this.form.controls.login;
      const password = this.form.controls.password;
      login.markAsTouched();
      password.markAsTouched();
      if (login.invalid || password.invalid) return;
      this.loading = true;
      this.auth.login({ login: login.value, password: password.value })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.storage.save(response.access_token, response.user);
            void this.router.navigate([`/${response.user.role}`]);
          },
          error: (error: unknown) => this.handleError(error),
        });
      return;
    }

    if (this.mode === 'forgot') {
      const email = this.form.controls.email;
      const password = this.form.controls.new_password;
      email.markAsTouched();
      password.markAsTouched();
      if (email.invalid || password.invalid) return;
      this.loading = true;
      this.auth.forgotPassword(email.value, password.value)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.serverMessage = response.message;
          },
          error: (error: unknown) => this.handleError(error),
        });
      return;
    }

    const controls = this.form.controls;
    controls.name.markAsTouched();
    controls.email.markAsTouched();
    controls.phone.markAsTouched();
    controls.password.markAsTouched();
    if (controls.role.value === 'driver') {
      controls.license_number.markAsTouched();
      controls.plate.markAsTouched();
      controls.brand.markAsTouched();
      controls.model.markAsTouched();
      controls.year.markAsTouched();
      controls.capacity.markAsTouched();
      controls.color.markAsTouched();
    }
    if (controls.name.invalid || controls.email.invalid || controls.phone.invalid || controls.password.invalid) return;
    if (controls.role.value === 'driver' &&
      (!controls.license_number.value || !controls.plate.value || !controls.brand.value ||
        !controls.model.value || !controls.color.value || controls.year.invalid || controls.capacity.invalid)) return;

    const input: RegisterRequest = {
      name: controls.name.value,
      email: controls.email.value,
      phone: controls.phone.value,
      password: controls.password.value,
      role: controls.role.value,
    };
    if (input.role === 'driver') {
      input.license_number = controls.license_number.value;
      input.plate = controls.plate.value;
      input.brand = controls.brand.value;
      input.model = controls.model.value;
      input.year = controls.year.value;
      input.capacity = controls.capacity.value;
      input.color = controls.color.value;
    }
    this.loading = true;
    this.auth.register(input).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.loading = false;
        this.storage.save(response.access_token, response.user);
        void this.router.navigate([`/${response.user.role}`]);
      },
      error: (error: unknown) => this.handleError(error),
    });
  }

  private handleError(error: unknown): void {
    this.loading = false;
    if (error instanceof HttpErrorResponse && error.status === 422) {
      const details = parseApiError(error);
      this.validationErrors = details.errors ?? {};
      this.serverMessage = details.message ?? 'Revisa los campos indicados.';
      return;
    }
    this.serverMessage = error instanceof HttpErrorResponse
      ? (parseApiError(error).message ?? 'No fue posible conectar con el servidor.')
      : 'Ocurrió un error inesperado.';
  }

  fieldError(field: string): string {
    return this.validationErrors[field]?.[0] ?? '';
  }
}
