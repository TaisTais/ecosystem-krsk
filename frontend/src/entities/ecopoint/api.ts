// src/entities/ecopoint/api.ts
import api from '../../shared/lib/api';
import type { EcoPoint, EcoPointDetail, EcoPointList } from './types';

export const ecopointApi = {
  getAll: async (): Promise<EcoPointList[]> => {
    const response = await api.get('/map/');
    return response.data;
  },

  getById: async (id: number): Promise<EcoPoint> => {
    const response = await api.get(`/map/${id}`);
    return response.data;
  },

  getDetail: async (id: number): Promise<EcoPointDetail> => {
    const response = await api.get(`/map/${id}/full`);
    return response.data;
  },

  create: async (data: unknown): Promise<EcoPoint> => {
    const response = await api.post('/map/', data);
    return response.data;
  },

  update: async (id: number, data: unknown): Promise<EcoPoint> => {
    const response = await api.put(`/map/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/map/${id}`);
  },
};