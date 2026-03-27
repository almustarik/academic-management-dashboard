import { apiClient } from '@/lib/axios';
import { Student } from '@/types';

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    const { data } = await apiClient.get<Student[]>('/students');
    return data;
  },

  getById: async (id: string): Promise<Student> => {
    const { data } = await apiClient.get<Student>(`/students/${id}`);
    return data;
  },

  create: async (student: Omit<Student, 'id'>): Promise<Student> => {
    const { data } = await apiClient.post<Student>('/students', student);
    return data;
  },

  update: async (id: string, updates: Partial<Student>): Promise<Student> => {
    const { data } = await apiClient.patch<Student>(`/students/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  }
};
