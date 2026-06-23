import { useCallback, useEffect, useState } from 'react';
import { userApi } from '../../../entities/profile/api';
import type { MyEventsRead } from '../../../entities/profile/types';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Не удалось загрузить события';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEvents();
  }, [fetchEvents]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchEvents 
  };
};