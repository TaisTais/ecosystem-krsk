import { useCallback, useEffect, useState } from 'react';
import { userApi } from '@/entities/profile/api';
import type { ComplaintList } from '@/entities/complaints/types';

type UseMyComplaintsResult = {
  data: ComplaintList | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useMyComplaints = (): UseMyComplaintsResult => {
  const [data, setData] = useState<ComplaintList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await userApi.getMyComplaints();   // ← вот здесь главное изменение
      setData(result);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Не удалось загрузить жалобы';
      setError(message);
      console.error(err);
      setData(null);
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