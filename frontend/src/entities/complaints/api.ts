import api from '../../shared/lib/api';
import type { ComplaintCreate, ComplaintRead } from './types';

export const complaintsApi = {
  createComplaint: async (data: ComplaintCreate): Promise<ComplaintRead> => {
    const { data: response } = await api.post<ComplaintRead>('/complaints/', data);
    return response;
  },

  getAllComplaints: async (params?: { skip?: number; limit?: number; status?: string }) => {
    const { data } = await api.get('/complaints/', { params });
    return data;
  },

  
};