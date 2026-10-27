import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { Fare } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class FaresApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  getActive(): Observable<{ success: boolean; fare: Fare }> {
    return this.http.get<{ success: boolean; fare: Fare }>(`${this.base}${API_ENDPOINTS.fares.active}`);
  }
}
