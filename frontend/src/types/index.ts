export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}
