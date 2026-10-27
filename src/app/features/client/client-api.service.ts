import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  ActiveRideResponse, Estimate, EstimateRequest, PageData, RatingRequest,
  RideRequest, RideRequestInput, Trip,
} from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  estimate(input: EstimateRequest): Observable<{ success: boolean; estimate: Estimate }> {
    return this.http.post<{ success: boolean; estimate: Estimate }>(
      `${this.base}${API_ENDPOINTS.client.estimate}`, input,
    );
  }

  requestRide(input: RideRequestInput): Observable<{ success: boolean; message: string; ride_request: RideRequest }> {
    return this.http.post<{ success: boolean; message: string; ride_request: RideRequest }>(
      `${this.base}${API_ENDPOINTS.client.rideRequests}`, input,
    );
  }

  active(): Observable<ActiveRideResponse> {
    return this.http.get<ActiveRideResponse>(`${this.base}${API_ENDPOINTS.client.active}`);
  }

  cancel(id: number, reason: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.base}${API_ENDPOINTS.client.cancel(id)}`, { reason },
    );
  }

  trips(): Observable<{ success: boolean; trips: PageData<Trip> }> {
    return this.http.get<{ success: boolean; trips: PageData<Trip> }>(`${this.base}${API_ENDPOINTS.client.trips}`);
  }

  rate(id: number, input: RatingRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.base}${API_ENDPOINTS.client.rating(id)}`, input,
    );
  }
}
