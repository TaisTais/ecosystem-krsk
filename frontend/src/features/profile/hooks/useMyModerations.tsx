import { useCallback, useEffect, useState } from 'react';
import { userApi } from '../../../entities/users/api';

type ModerationRecord = Record<string, unknown>; // или замени на настоящий тип позже

type UseMyModerationsResult = {
  data: ModerationRecord[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useMyModerations = (): UseMyModerationsResult => {
  const [data, setData] = useState<ModerationRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModerations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await userApi.getMyModerations();
      setData(result);
    } catch (err) {
      setError('Не удалось загрузить заявки на модерацию');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchModerations();
  }, [fetchModerations]);

  return { data, loading, error, refetch: fetchModerations };
};