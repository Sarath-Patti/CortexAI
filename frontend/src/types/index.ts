export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface WorkspaceCreateRequest {
  name: string;
  description?: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
}

// AI Runtime & Provider Abstraction Types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  prompt: string;
  system_prompt?: string;
  history?: ChatMessage[];
  provider?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface UsageInfo {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatResponse {
  response: string;
  provider: string;
  model: string;
  latency_ms: number;
  request_id: string;
  usage?: UsageInfo;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  is_default?: boolean;
}

export interface ProviderInfo {
  name: string;
  is_default: boolean;
  available: boolean;
  models: ModelInfo[];
}

// Document Intelligence & RAG Types
export interface Document {
  id: string;
  workspace_id?: string | null;
  owner_id: string;
  filename: string;
  file_type: string;
  size: number;
  status: string;
  chunk_count: number;
  created_at: string;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  file_type: string;
  size: number;
  status: string;
  chunk_count: number;
}

export interface RetrievedChunk {
  text: string;
  similarity_score: number;
  metadata: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  chunks: RetrievedChunk[];
}

export interface KnowledgeChatRequest {
  prompt: string;
  system_prompt?: string;
  workspace_id?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_k?: number;
}

export interface KnowledgeChatResponse {
  response: string;
  provider: string;
  model: string;
  latency_ms: number;
  request_id: string;
  retrieved_chunks: RetrievedChunk[];
  usage?: UsageInfo;
}
