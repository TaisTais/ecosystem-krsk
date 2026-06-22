import api from '../../shared/lib/api';
import type { UserPublicRead, UserAchievementList, MyEventsRead } from './types';

const API_BASE = '/me';

export const userApi = {
  getMyProfile: async (): Promise<UserPublicRead> => {
    const { data } = await api.get(`${API_BASE}/`);
    return data;
  },

  getMyAchievements: async (): Promise<UserAchievementList> => {
    const { data } = await api.get(`${API_BASE}/achievements`);
    return data;
  },

  getMyEvents: async (skip = 0, limit = 20): Promise<MyEventsRead> => {
    const { data } = await api.get(`${API_BASE}/events`, {
      params: { skip, limit },
    });
    return data;
  },

  getMyModerations: async (skip = 0, limit = 20) => {
    const { data } = await api.get(`${API_BASE}/moderations`, {
      params: { skip, limit },
    });
    return data;
  },

  getMyModerationActions: async (skip = 0, limit = 50) => {
    const { data } = await api.get(`${API_BASE}/moderation-actions`, {
      params: { skip, limit },
    });
    return data;
  },

  getMyComplaints: async (skip = 0, limit = 20) => {
    const { data } = await api.get(`${API_BASE}/complaints`, {
      params: { skip, limit },
    });
    return data;
  },
};