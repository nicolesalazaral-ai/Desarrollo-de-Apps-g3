import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { DriverTrip, LocationUpdate, PendingRideRequest } from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class DriverApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  setAvailability(status: 'available' | 'unavailable'): Observable<{ success: boolean; message: string; availability_status: string }> {
    return this.http.put<{ success: boolean; message: string; availability_status: string }>(
      `${this.base}${API_ENDPOINTS.driver.availability}`, { status },
    );
  }

  requests(): Observable<{ success: boolean; requests: PendingRideRequest[] }> {
    return this.http.get<{ success: boolean; requests: PendingRideRequest[] }>(
      `${this.base}${API_ENDPOINTS.driver.rideRequests}`,
    );
  }

  accept(id: number): Observable<{ success: boolean; message: string; trip: DriverTrip }> {
    return this.http.post<{ success: boolean; message: string; trip: DriverTrip }>(
      `${this.base}${API_ENDPOINTS.driver.accept(id)}`, {},
    );
  }

  arrive(id: number): Observable<{ success: boolean; message: string; trip: DriverTrip }> {
    return this.http.post<{ success: boolean; message: string; trip: DriverTrip }>(
      `${this.base}${API_ENDPOINTS.driver.arrive(id)}`, {},
    );
  }

  start(id: number): Observable<{ success: boolean; message: string; trip: DriverTrip }> {
    return this.http.post<{ success: boolean; message: string; trip: DriverTrip }>(
      `${this.base}${API_ENDPOINTS.driver.start(id)}`, {},
    );
  }

  complete(id: number, actual_distance_km: number, actual_duration_min: number): Observable<{ success: boolean; message: string; trip: DriverTrip }> {
    return this.http.post<{ success: boolean; message: string; trip: DriverTrip }>(
      `${this.base}${API_ENDPOINTS.driver.complete(id)}`,
      { actual_distance_km, actual_duration_min },
    );
  }

  sendLocation(input: LocationUpdate): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.base}${API_ENDPOINTS.driver.location}`, input);
  }
}
