import { useEffect, useState } from 'react';
import { ecopointApi } from '../../../entities/map/api';
import type { EcoPointList } from '../../../entities/map/types';

export const useEcoPoints = () => {
  const [points, setPoints] = useState<EcoPointList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPoints = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ecopointApi.getAll();
        const pointsArray = Array.isArray(response) ? response : [];
        setPoints(pointsArray);
      } catch (err: unknown) {
        console.error('Ошибка загрузки эко-точек:', err);
        setError('Не удалось загрузить эко-точки');
      } finally {
        setLoading(false);
      }
    };

    loadPoints();
  }, []);

  return { points, loading, error };
};