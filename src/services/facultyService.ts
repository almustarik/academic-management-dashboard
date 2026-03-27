import { apiClient } from '@/lib/axios';
import { Faculty } from '@/types';

export const facultyService = {
  getAll: async (): Promise<Faculty[]> => {
    const { data } = await apiClient.get<Faculty[]>('/faculty');
    return data;
  },

  getById: async (id: string): Promise<Faculty> => {
    const { data } = await apiClient.get<Faculty>(`/faculty/${id}`);
    return data;
  },

  create: async (faculty: Omit<Faculty, 'id'>): Promise<Faculty> => {
    const { data } = await apiClient.post<Faculty>('/faculty', faculty);
    return data;
  },

  update: async (id: string, updates: Partial<Faculty>): Promise<Faculty> => {
    const { data } = await apiClient.patch<Faculty>(`/faculty/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/faculty/${id}`);
  }
};
