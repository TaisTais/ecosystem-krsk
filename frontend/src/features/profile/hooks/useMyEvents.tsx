import { useCallback, useEffect, useState } from 'react';
import { userApi } from '../../../entities/users/api';
import type { MyEventsRead } from '../../../entities/users/types';

type UseMyEventsResult = {
  data: MyEventsRead | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useMyEvents = (): UseMyEventsResult => {
  const [data, setData] = useState<MyEventsRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await userApi.getMyEvents();
      setData(result);
    } catch (err) {
      setError('Не удалось загрузить события');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEvents();
  }, [fetchEvents]);

  return { data, loading, error, refetch: fetchEvents };
};