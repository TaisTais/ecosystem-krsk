import axios from 'axios';
import type {
  EventCreatePayload,
  EventFilterParams,
  EventRead,
  EventUpdatePayload,
  MyEventsRead,
} from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(request => {
  console.log('🚀 API Request:', request.method, request.url);
  return request;
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const eventsApi = {
  getCalendar: async (params: EventFilterParams) => {
    const { data } = await api.get<EventRead[]>('/events/', { params });
    return data;
  },

  getMyEvents: async (params?: { skip?: number; limit?: number }) => {
    const { data } = await api.get<MyEventsRead>('/events/my', { params });
    return data;
  },

  createEvent: async (payload: EventCreatePayload) => {
    const { data } = await api.post<EventRead>('/events/', payload);
    return data;
  },

  updateEvent: async (eventId: number, payload: EventUpdatePayload) => {
    const { data } = await api.patch<EventRead>(`/events/${eventId}`, payload);
    return data;
  },

  deleteEvent: async (eventId: number, reason: string) => {
    const { data } = await api.delete(`/events/${eventId}`, { params: { reason } });
    return data;
  },

  applyToEvent: async (eventId: number) => {
    const { data } = await api.post(`/events/${eventId}/apply`);
    return data;
  },

  cancelApplication: async (eventId: number) => {
    const { data } = await api.delete(`/events/${eventId}/apply`);
    return data;
  },

  confirmParticipation: async (eventId: number, proof_photo_url: string, comment?: string) => {
    const { data } = await api.post(`/events/${eventId}/participate`, {
      proof_photo_url,
      comment: comment ?? null,
    });
    return data;
  },
};