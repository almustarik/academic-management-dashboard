import { apiClient } from '@/lib/axios';
import { Course } from '@/types';

export const courseService = {
  getAll: async (): Promise<Course[]> => {
    const { data } = await apiClient.get<Course[]>('/courses');
    return data;
  },

  getById: async (id: string): Promise<Course> => {
    const { data } = await apiClient.get<Course>(`/courses/${id}`);
    return data;
  },

  create: async (course: Omit<Course, 'id'>): Promise<Course> => {
    const { data } = await apiClient.post<Course>('/courses', course);
    return data;
  },

  update: async (id: string, updates: Partial<Course>): Promise<Course> => {
    const { data } = await apiClient.patch<Course>(`/courses/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  }
};
