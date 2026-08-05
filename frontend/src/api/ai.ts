import { apiClient } from './client';
import { ChatRequest, ChatResponse, ModelInfo, ProviderInfo } from '../types';

export async function sendChatApi(request: ChatRequest): Promise<ChatResponse> {
  return apiClient<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getProvidersApi(): Promise<ProviderInfo[]> {
  return apiClient<ProviderInfo[]>('/chat/providers');
}

export async function getModelsApi(provider?: string): Promise<ModelInfo[]> {
  const url = provider
    ? `/chat/models?provider=${encodeURIComponent(provider)}`
    : '/chat/models';
  return apiClient<ModelInfo[]>(url);
}
