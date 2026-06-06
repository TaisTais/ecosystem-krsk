// src/features/map/ui/MapBlock.tsx
import { useEffect, useState } from 'react';
import { ecopointApi } from '../../../entities/ecopoint/api';
import type { EcoPoint } from '../../../entities/ecopoint/types';

const MapBlock = () => {
  const [points, setPoints] = useState<EcoPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPoints = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await ecopointApi.getAll();
        console.log('✅ Получено эко-точек:', data.length);
        
        setPoints(data);
      } catch (err: unknown) {
        console.error('❌ Ошибка загрузки эко-точек:', err);
        
        let message = 'Не удалось загрузить точки';

        if (err && typeof err === 'object' && err !== null && 'response' in err) {
          const errorObj = err as { response?: { data?: { detail?: string } } };
          message = errorObj.response?.data?.detail || message;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadPoints();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-40">
        <h1 className="text-xl font-semibold">Карта эко-точек</h1>
        <p className="text-sm text-gray-500">
          {loading ? 'Загрузка...' : `${points.length} точек`}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {loading && <div className="text-center py-12">Загрузка точек...</div>}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl">
            {error}
          </div>
        )}

        {!loading && !error && points.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Пока нет эко-точек в базе
          </div>
        )}

        {points.map((point) => (
          <div key={point.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg">{point.name}</h3>
            <p className="text-gray-600 mt-1">{point.address}</p>
            
            {point.working_hours && (
              <p className="text-sm text-gray-500 mt-2">🕒 {point.working_hours}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {point.types?.map((type, index) => (
                <span 
                  key={index}
                  className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapBlock;