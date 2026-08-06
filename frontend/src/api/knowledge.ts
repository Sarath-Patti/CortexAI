import { apiClient } from './client';
import {
  Document,
  DocumentUploadResponse,
  KnowledgeChatRequest,
  KnowledgeChatResponse,
  SearchResponse,
} from '../types';

export async function uploadDocumentApi(
  file: File,
  workspaceId?: string
): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (workspaceId) {
    formData.append('workspace_id', workspaceId);
  }

  const token = localStorage.getItem('cortex_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
  const response = await fetch(`${BASE_URL}/knowledge/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'Failed to upload document');
  }

  return response.json();
}

export async function searchKnowledgeApi(
  query: string,
  workspaceId?: string,
  topK: number = 5
): Promise<SearchResponse> {
  return apiClient<SearchResponse>('/knowledge/search', {
    method: 'POST',
    body: JSON.stringify({ query, workspace_id: workspaceId, top_k: topK }),
  });
}

export async function sendKnowledgeChatApi(
  request: KnowledgeChatRequest
): Promise<KnowledgeChatResponse> {
  return apiClient<KnowledgeChatResponse>('/knowledge/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getDocumentsApi(workspaceId?: string): Promise<Document[]> {
  const url = workspaceId
    ? `/knowledge/documents?workspace_id=${encodeURIComponent(workspaceId)}`
    : '/knowledge/documents';
  return apiClient<Document[]>(url);
}

export async function deleteDocumentApi(id: string): Promise<void> {
  return apiClient<void>(`/knowledge/documents/${id}`, {
    method: 'DELETE',
  });
}
