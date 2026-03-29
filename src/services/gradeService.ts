import { apiClient } from '@/lib/axios';
import { Grade } from '@/types';

export const gradeService = {
  getAll: async () => {
    const { data } = await apiClient.get<Grade[]>('/grades');
    return data;
  },
  getByCourse: async (courseId: string) => {
    const { data } = await apiClient.get<Grade[]>(`/grades?courseId=${courseId}`);
    return data;
  },
  update: async (id: string, payload: Partial<Grade>) => {
    const { data } = await apiClient.patch<Grade>(`/grades/${id}`, payload);
    return data;
  },
  create: async (payload: Omit<Grade, 'id'>) => {
    const { data } = await apiClient.post<Grade>('/grades', payload);
    return data;
  }
};
