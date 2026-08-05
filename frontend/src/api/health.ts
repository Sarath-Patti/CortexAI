import { apiClient } from './client';
import { HealthStatus } from '../types';

export const fetchHealthStatus = async (): Promise<HealthStatus> => {
  return apiClient<HealthStatus>('/health');
};
