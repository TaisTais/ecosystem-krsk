import api from '../../shared/lib/api';
import type {
  EventCreatePayload,
  EventFilterParams,
  EventRead,
  EventUpdatePayload,
} from './types';

export const eventsApi = {
  getCalendar: async (params: EventFilterParams) => {
    const { data } = await api.get<EventRead[]>('/events/', { params });
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