import { apiClient } from './client';
import {
  Conversation,
  ConversationExportResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '../types';

export async function createConversationApi(
  title?: string,
  workspaceId?: string
): Promise<Conversation> {
  return apiClient<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ title, workspace_id: workspaceId }),
  });
}

export async function getConversationsApi(
  workspaceId?: string,
  query?: string
): Promise<Conversation[]> {
  const params = new URLSearchParams();
  if (workspaceId) params.append('workspace_id', workspaceId);
  if (query) params.append('q', query);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiClient<Conversation[]>(`/conversations${queryString}`);
}

export async function getConversationByIdApi(id: string): Promise<Conversation> {
  return apiClient<Conversation>(`/conversations/${id}`);
}

export async function renameConversationApi(
  id: string,
  title: string
): Promise<Conversation> {
  return apiClient<Conversation>(`/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversationApi(id: string): Promise<void> {
  return apiClient<void>(`/conversations/${id}`, {
    method: 'DELETE',
  });
}

export async function sendMessageApi(
  conversationId: string,
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  return apiClient<SendMessageResponse>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function exportConversationApi(
  conversationId: string,
  format: 'markdown' | 'json' = 'markdown'
): Promise<ConversationExportResponse> {
  return apiClient<ConversationExportResponse>(
    `/conversations/${conversationId}/export?format=${format}`
  );
}

export async function streamConversationApi(
  conversationId: string,
  params: {
    prompt: string;
    system_prompt?: string;
    provider?: string;
    model?: string;
    temperature?: number;
    max_tokens?: number;
    rag_enabled?: boolean;
    top_k?: number;
  },
  onChunk: (token: string, text: string) => void,
  onDone: (content: string, citations?: any[]) => void,
  onError: (error: string) => void
): Promise<() => void> {
  const token = localStorage.getItem('cortex_token');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  const queryParams = new URLSearchParams({
    prompt: params.prompt,
    temperature: String(params.temperature ?? 0.7),
    max_tokens: String(params.max_tokens ?? 1000),
    rag_enabled: String(params.rag_enabled ?? false),
    top_k: String(params.top_k ?? 5),
  });

  if (params.system_prompt) queryParams.append('system_prompt', params.system_prompt);
  if (params.provider) queryParams.append('provider', params.provider);
  if (params.model) queryParams.append('model', params.model);
  if (token) queryParams.append('token', token);

  const url = `${BASE_URL}/conversations/${conversationId}/stream?${queryParams.toString()}`;

  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  let isStreaming = true;

  fetch(url, {
    method: 'GET',
    headers,
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Streaming failed with status ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (isStreaming) {
        const { done, value } = await reader.read();
        if (done) {
          isStreaming = false;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            try {
              const data = JSON.parse(jsonStr);
              if (data.token) {
                onChunk(data.token, data.text);
              }
              if (data.done) {
                isStreaming = false;
                onDone(data.content, data.citations);
                return;
              }
              if (data.error) {
                isStreaming = false;
                onError(data.error);
                return;
              }
            } catch (err) {
              // Ignore partial chunk parse errors
            }
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err.message || 'Stream connection error');
      }
    });

  return () => controller.abort();
}
