import { useCallback, useEffect, useState } from 'react';
import { feedApi } from '../../../entities/feed/api';
import type { PostRead } from '../../../entities/feed/types';

type UseLatestPostResult = {
  post: PostRead | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export const useLatestPost = (): UseLatestPostResult => {
  const [post, setPost] = useState<PostRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const posts = await feedApi.getFeed({
        limit: 1,
        skip: 0,
      });

      setPost(posts[0] || null);
    } catch (err: unknown) {
      setError('Не удалось загрузить последний пост');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLatest();
  }, [fetchLatest]);

  return { post, loading, error, refetch: fetchLatest };
};