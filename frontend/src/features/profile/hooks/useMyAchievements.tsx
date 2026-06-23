import { useCallback, useEffect, useState } from 'react';
import { userApi } from '../../../entities/profile/api';
import type { UserAchievementList } from '../../../entities/profile/types';

type UseMyAchievementsResult = {
  data: UserAchievementList | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useMyAchievements = (): UseMyAchievementsResult => {
  const [data, setData] = useState<UserAchievementList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await userApi.getMyAchievements();
      setData(result);
    } catch (err) {
      setError('Не удалось загрузить достижения');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAchievements();
  }, [fetchAchievements]);

  return { data, loading, error, refetch: fetchAchievements };
};