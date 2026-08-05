import { apiClient } from './client';
import { User } from '../types';

export const getCurrentUserApi = async (): Promise<User> => {
  return apiClient<User>('/users/me');
};
