import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import {
  DashboardStats, DriverProfile, Fare, UndocumentedAdminRecord,
} from '../../core/models/api.models';

export interface AdminTripFilters {
  status?: string;
  driver_id?: number;
  client_id?: number;
  date?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  dashboard(): Observable<{
    success: boolean;
    stats: DashboardStats;
    recent_trips: UndocumentedAdminRecord[];
    recent_incidents: UndocumentedAdminRecord[];
  }> {
    return this.http.get<{
      success: boolean;
      stats: DashboardStats;
      recent_trips: UndocumentedAdminRecord[];
      recent_incidents: UndocumentedAdminRecord[];
    }>(`${this.base}${API_ENDPOINTS.admin.dashboard}`);
  }

  drivers(approval_status?: string): Observable<{ success: boolean; drivers: DriverProfile[] }> {
    let params = new HttpParams();
    if (approval_status) params = params.set('approval_status', approval_status);
    return this.http.get<{ success: boolean; drivers: DriverProfile[] }>(
      `${this.base}${API_ENDPOINTS.admin.drivers}`, { params },
    );
  }

  updateDriver(id: number, approval_status: string, admin_notes: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.base}${API_ENDPOINTS.admin.driverApproval(id)}`, { approval_status, admin_notes },
    );
  }

  fares(): Observable<UndocumentedAdminRecord> {
    // TODO: The API docs do not specify the GET /admin/fares response envelope.
    return this.http.get<UndocumentedAdminRecord>(`${this.base}${API_ENDPOINTS.admin.fares}`);
  }

  createFare(input: Omit<Fare, 'id'>): Observable<{ success: boolean; message: string; fare: Fare }> {
    return this.http.post<{ success: boolean; message: string; fare: Fare }>(
      `${this.base}${API_ENDPOINTS.admin.fares}`, input,
    );
  }

  trips(filters: AdminTripFilters): Observable<UndocumentedAdminRecord> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.driver_id) params = params.set('driver_id', filters.driver_id);
    if (filters.client_id) params = params.set('client_id', filters.client_id);
    if (filters.date) params = params.set('date', filters.date);
    // TODO: The API docs list filters but do not define the response envelope or trip fields.
    return this.http.get<UndocumentedAdminRecord>(`${this.base}${API_ENDPOINTS.admin.trips}`, { params });
  }

  reports(): Observable<UndocumentedAdminRecord> {
    // TODO: API_DOCUMENTATION.md does not define the report response schema.
    return this.http.get<UndocumentedAdminRecord>(`${this.base}${API_ENDPOINTS.admin.reports}`);
  }

  auditLogs(): Observable<UndocumentedAdminRecord> {
    // TODO: API_DOCUMENTATION.md does not define the audit-log response schema.
    return this.http.get<UndocumentedAdminRecord>(`${this.base}${API_ENDPOINTS.admin.auditLogs}`);
  }
}
