import { apiClient } from './client';
import { Workspace, WorkspaceCreateRequest } from '../types';

export const createWorkspaceApi = async (
  data: WorkspaceCreateRequest
): Promise<Workspace> => {
  return apiClient<Workspace>('/workspaces', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getWorkspacesApi = async (): Promise<Workspace[]> => {
  return apiClient<Workspace[]>('/workspaces');
};

export const getWorkspaceByIdApi = async (id: string): Promise<Workspace> => {
  return apiClient<Workspace>(`/workspaces/${id}`);
};
