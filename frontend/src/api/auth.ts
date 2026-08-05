import { apiClient } from './client';
import { LoginRequest, RegisterRequest, Token, User } from '../types';

export const registerApi = async (data: RegisterRequest): Promise<User> => {
  return apiClient<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const loginApi = async (data: LoginRequest): Promise<Token> => {
  return apiClient<Token>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
