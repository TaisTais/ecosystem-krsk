import { useCallback, useEffect, useState } from 'react';
import { userApi } from '../../../entities/profile/api';
import type { UserPublicRead } from '../../../entities/profile/types';

type UseMyProfileResult = {
  data: UserPublicRead | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useMyProfile = (): UseMyProfileResult => {
  const [data, setData] = useState<UserPublicRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profile = await userApi.getMyProfile();
      setData(profile);
    } catch {
      setError('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProfile();
  }, [fetchProfile]);

  return {
    data,
    loading,
    error,
    refetch: fetchProfile,
  };
};