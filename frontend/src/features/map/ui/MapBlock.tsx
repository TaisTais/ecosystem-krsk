// src/features/map/ui/MapBlock.tsx
import { useState } from 'react';
import { useEcoPoints } from '../hooks/useEcoPoints';
import { Search, Filter, MessageCircle, Clock, MapPin, ThumbsUp, XCircle, CircleEllipsis } from 'lucide-react';
import { ecopointApi } from '../../../entities/ecopoint/api';
import type { EcoPoint, EcoPointDetail, EcoPointStatus } from '../../../entities/ecopoint/types';

const MapBlock = () => {
  const { points, loading, error } = useEcoPoints();
  const [search, setSearch] = useState('');
  const [expandedPointId, setExpandedPointId] = useState<number | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [fullPointCache, setFullPointCache] = useState<Record<number, EcoPoint>>({});
  const [showModal, setShowModal] = useState<'reviews' | 'statuses' | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<EcoPointDetail | null>(null);

  const filteredPoints = points.filter(point =>
    point.name.toLowerCase().includes(search.toLowerCase()) ||
    point.address.toLowerCase().includes(search.toLowerCase())
  );

  const loadFullPoint = async (id: number): Promise<EcoPoint | null> => {
    if (fullPointCache[id]) return fullPointCache[id];
    
    try {
      const fullPoint = await ecopointApi.getById(id);
      setFullPointCache(prev => ({ ...prev, [id]: fullPoint }));
      return fullPoint;
    } catch (err) {
      console.error('Ошибка загрузки полной точки:', err);
      return null;
    }
  };

  const toggleExpand = async (id: number) => {
    if (expandedPointId === id) {
      setExpandedPointId(null);
    } else {
      setExpandedPointId(id);
      const full = await loadFullPoint(id);
      if (full) {
        setSelectedPoint(null); // сбрасываем, чтобы не было конфликта типов
      }
    }
  };

  const openModal = async (type: 'reviews' | 'statuses', id: number) => {
    try {
      const detail = await ecopointApi.getDetail(id);   // загружаем полную версию
      setSelectedPoint(detail);
      setShowModal(type);
    } catch (err) {
      console.error('Ошибка загрузки деталей:', err);
    }
  };
  const currentExpandedPoint = expandedPointId ? fullPointCache[expandedPointId] : null;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      plastic: 'bg-lime-100 text-lime-700',
      glass: 'bg-sky-100 text-sky-700',
      paper: 'bg-amber-100 text-amber-700',
      metal: 'bg-slate-200 text-slate-700',
      batteries: 'bg-red-100 text-red-700',
      electronics: 'bg-orange-100 text-orange-700',
      clothes: 'bg-purple-100 text-purple-700',
      hazardous: 'bg-yellow-100 text-yellow-700',
      other: 'bg-gray-100 text-gray-700',
      own_tara: 'bg-emerald-100 text-emerald-700',
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: EcoPointStatus) => {
    switch (status) {
      case 'working':
        return <ThumbsUp size={18} className="text-emerald-600" />;
      case 'closed':
        return <XCircle size={18} className="text-red-600" />;
      case 'temporarily_closed':
        return <CircleEllipsis size={18} className="text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Поиск */}
      <div className="px-4 py-3 sticky top-0 z-50 bg-white border-b">
        <div className="relative flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Поиск эко-точек..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-base rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={22} />
          </div>
          <button className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl">
            <Filter size={24} />
          </button>
        </div>
      </div>

      {/* Карта */}
      <div 
        className={`bg-gray-200 border-b transition-all duration-300 shrink-0 relative ${isMapExpanded ? 'h-screen' : 'h-[38vh]'}`}
        onClick={() => setIsMapExpanded(!isMapExpanded)}
      >
        <div className="h-full flex items-center justify-center bg-linear-to-br from-emerald-50 to-teal-100">
          <div className="text-center">
            <div className="text-7xl mb-4">🗺️</div>
            <p className="font-semibold text-lg">Интерактивная карта</p>
            <p className="text-sm text-gray-500">Нажмите, чтобы развернуть / свернуть</p>
          </div>
        </div>
      </div>

      {/* Список точек */}
      <div className="p-4 space-y-4 pb-24">
        {loading && <div className="text-center py-12">Загрузка точек...</div>}
        {error && <div className="bg-red-50 p-4 rounded-2xl text-red-600">{error}</div>}

        {filteredPoints.map((point) => {
          const isExpanded = expandedPointId === point.id;
          const fullPoint = currentExpandedPoint?.id === point.id ? currentExpandedPoint : null;

          return (
            <div 
              key={point.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Основная карточка */}
              <div 
                onClick={() => toggleExpand(point.id)}
                className="p-5 cursor-pointer active:bg-gray-50"
              >
                <h3 className="font-semibold text-xl leading-tight">{point.name}</h3>
                
                <p className="text-gray-600 text-sm mt-2 flex items-center gap-1.5">
                  <MapPin size={18} className="text-gray-400" /> {point.address}
                </p>

                {point.working_hours && (
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" /> {point.working_hours}
                  </p>
                )}

                {point.types?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {point.types.map((type, index) => (
                      <span 
                        key={index}
                        className={`text-xs px-4 py-1.5 rounded-2xl font-medium ${getTypeColor(type)}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Раскрытая карточка */}
              {isExpanded && fullPoint && (
                <div className="p-5 space-y-5 border-t">
                  {fullPoint.description && (
                    <p className="text-gray-700 leading-relaxed">{fullPoint.description}</p>
                  )}

                  {/* Контакты */}
                  {fullPoint.contacts && Object.keys(fullPoint.contacts).length > 0 && (
                    <div className="space-y-2 pt-2">
                      {Object.entries(fullPoint.contacts).map(([key, value]) => (
                        <a
                          key={key}
                          href={key === 'phone' ? `tel:${value}` : key === 'telegram' ? `https://t.me/${value.replace('@','')}` : undefined}
                          className="block text-emerald-600 hover:text-emerald-700 py-1"
                        >
                          {value}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Блоки со счетчиками */}
                  <div className="flex gap-4">
                    <div 
                      onClick={() => openModal('statuses', point.id)}   // ← добавили point.id
                      className="flex-1 flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl cursor-pointer hover:bg-emerald-100 active:bg-emerald-200"
                    >
                      {getStatusIcon(fullPoint?.most_confirmed_status?.status || 'working')}
                      <div>
                        <p className="text-sm font-medium">Статусы</p>
                        <p className="text-emerald-600 text-sm">
                          {fullPoint?.most_confirmed_status?.confirmed_by || 0}
                        </p>
                      </div>
                    </div>
                    <div 
                      onClick={() => openModal('reviews', point.id)}    // ← добавили point.id
                      className="flex-1 flex items-center gap-3 bg-gray-50 p-4 rounded-2xl cursor-pointer hover:bg-gray-100 active:bg-gray-200"
                    >
                      <MessageCircle size={20} className="text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Отзывы</p>
                        <p className="text-gray-600 text-sm">{fullPoint?.reviews_count ?? 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 pt-3 border-t">
                    Последнее обновление: {fullPoint.last_local_update_at 
                      ? new Date(fullPoint.last_local_update_at).toLocaleDateString('ru-RU', { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })
                      : 'Нет данных'}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredPoints.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Ничего не найдено по вашему запросу
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {showModal && selectedPoint && (
        <div className="fixed inset-0 bg-black/70 z-100 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-110 max-h-[90vh] rounded-3xl overflow-hidden flex flex-col">

            {/* Заголовок */}
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">{selectedPoint.name}</h2>
              <button 
                onClick={() => setShowModal(null)} 
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Содержимое */}
            <div className="flex-1 overflow-auto">

              {/* Статистика статусов */}
              <div className="p-5 border-b">
                <p className="text-sm font-medium text-gray-500 mb-4">Статусы от пользователей</p>
                <div className="space-y-3">
                  {selectedPoint.statuses_summary && selectedPoint.statuses_summary.length > 0 ? (
                    selectedPoint.statuses_summary.map((s, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(s.status)}
                          <span className="capitalize font-medium">{s.status}</span>
                        </div>
                        <span className="font-semibold text-xl text-emerald-600">
                          {s.confirmed_by}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-gray-500">Пока нет статусов</p>
                  )}
                </div>
              </div>
                
              {/* Отзывы */}
              <div className="p-5">
                <p className="text-sm font-medium text-gray-500 mb-4">Отзывы ({selectedPoint.reviews_count})</p>
                
                {selectedPoint.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {selectedPoint.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-none last:pb-0">
                        {review.comment && (
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        )}
                        {review.photo_url && (
                          <img 
                            src={review.photo_url} 
                            alt="Фото" 
                            className="mt-4 rounded-2xl w-full max-h-64 object-cover"
                          />
                        )}
                        <p className="text-xs text-gray-500 mt-4">
                          {new Date(review.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-500">Пока нет отзывов</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapBlock;