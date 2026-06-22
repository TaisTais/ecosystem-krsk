import { useCallback, useEffect, useState } from 'react';
import { userApi } from '../../../entities/users/api';

type UseMyComplaintsResult = {
  data: unknown[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useMyComplaints = (): UseMyComplaintsResult => {
  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await userApi.getMyComplaints();
      setData(result);
    } catch {
      setError('Не удалось загрузить жалобы');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchComplaints();
  }, [fetchComplaints]);

  return { data, loading, error, refetch: fetchComplaints };
};