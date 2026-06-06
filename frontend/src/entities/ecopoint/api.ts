// src/entities/ecopoint/api.ts
import api from '../../shared/lib/api';
import type { EcoPoint } from './types';

export const ecopointApi = {
  getAll: async (): Promise<EcoPoint[]> => {
    const response = await api.get('/ecopoints/');
    return response.data;
  },

  getById: async (id: number): Promise<EcoPoint> => {
    const response = await api.get(`/ecopoints/${id}`);
    return response.data;
  },

  create: async (data: unknown): Promise<EcoPoint> => {
    const response = await api.post('/ecopoints/', data);
    return response.data;
  },

  update: async (id: number, data: unknown): Promise<EcoPoint> => {
    const response = await api.put(`/ecopoints/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ecopoints/${id}`);
  },
};