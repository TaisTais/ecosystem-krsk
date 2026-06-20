import { useCallback, useEffect, useState } from 'react';
import { eventsApi } from '../../../entities/events/api';
import type { EventRead } from '../../../entities/events/types';

type Params = {
  startDate: string;
  endDate: string;
};

export const useEventsCalendar = ({ startDate, endDate }: Params) => {
  const [events, setEvents] = useState<EventRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refetch = useCallback(() => {
    setRefreshToken((v) => v + 1);
  }, []);

  useEffect(() => {
    let alive = true;

    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await eventsApi.getCalendar({
          start_date: startDate,
          end_date: endDate,
          skip: 0,
          limit: 200,
        });

        console.log('✅ Реальные события от бэкенда:', data);

        const filtered = Array.isArray(data)
          ? data.filter(event => event.status !== 'cancelled')
          : [];

        if (alive) setEvents(filtered);
      } catch (err) {
        console.error('Ошибка загрузки событий:', err);
        if (alive) setError('Не удалось загрузить события');
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadEvents();

    return () => { alive = false; };
  }, [startDate, endDate, refreshToken]);

  return { events, loading, error, refetch };
};