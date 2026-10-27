export type UserRole = 'client' | 'driver' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'suspended' | 'rejected';
export type RideStatus = 'requested' | 'assigned' | 'driver_arrived' | 'in_progress' | 'completed' | 'cancelled';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'client' | 'driver';
  license_number?: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  capacity?: number;
  color?: string;
}

export interface Fare {
  id: number;
  name: string;
  base_fare: number;
  price_per_km: number;
  price_per_minute: number;
  minimum_fare: number;
  surge_multiplier: number;
  active: boolean;
}

export interface FareBreakdown {
  base_fare: number;
  price_per_km: number;
  price_per_minute: number;
  minimum_fare: number;
  surge_multiplier: number;
}

export interface EstimateRequest {
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
}

export interface Estimate {
  distance_km: number;
  duration_min: number;
  estimated_fare: number;
  currency: string;
  fare_breakdown: FareBreakdown;
}

export interface RideRequestInput extends EstimateRequest {
  origin_name: string;
  destination_name: string;
}

export interface RideRequest {
  id: number;
  client_id?: number;
  origin_name: string;
  origin_latitude?: number;
  origin_longitude?: number;
  destination_name: string;
  destination_latitude?: number;
  destination_longitude?: number;
  estimated_distance_km: number;
  estimated_duration_min?: number;
  estimated_fare: number;
  status: RideStatus;
  created_at?: string;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
}

export interface DriverSummary {
  id: number;
  rating_average?: number;
  user: { name: string; phone?: string };
  latest_location?: DriverLocation;
}

export interface Vehicle {
  plate: string;
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
}

export interface ActiveTrip {
  id: number;
  status: RideStatus;
  estimated_fare?: number;
  driver?: DriverSummary;
  vehicle?: Vehicle;
}

export interface ActiveRideResponse {
  success: boolean;
  has_active: boolean;
  type?: 'trip' | 'ride_request';
  data?: ActiveTrip | RideRequest;
}

export interface Trip {
  id: number;
  final_fare?: number;
  estimated_fare?: number;
  status: RideStatus;
  completed_at?: string;
  driver?: { user: { name: string } };
  vehicle?: { plate: string };
}

export interface PageData<T> {
  data: T[];
}

export interface RatingRequest {
  score: number;
  comment: string;
  has_incident: boolean;
}

export interface PendingRideRequest {
  id: number;
  origin_name: string;
  destination_name: string;
  estimated_distance_km: number;
  estimated_fare: number;
  client: { name: string; phone: string };
}

export interface DriverTrip {
  id: number;
  request_id?: number;
  status: RideStatus;
  estimated_fare?: number;
  final_fare?: number;
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  trip_id: number;
}

export interface DriverProfile {
  id: number;
  license_number: string;
  approval_status: ApprovalStatus;
  rating_average?: number;
  user: { name: string; email?: string };
  vehicles: Vehicle[];
}

export interface DashboardStats {
  total_clients: number;
  total_drivers: number;
  pending_drivers: number;
  approved_drivers: number;
  active_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  pending_requests: number;
  total_revenue: number;
}

// TODO: API_DOCUMENTATION.md does not define the response shapes for admin trips, reports, or audit logs.
export type UndocumentedAdminRecord = Record<string, unknown>;
