import { useMemo, useRef, useState } from 'react';
import {
  Search,
  Filter,
  MessageCircle,
  Clock,
  MapPin,
  ThumbsUp,
  XCircle,
  CircleEllipsis,
  Plus,
  X,
  ImagePlus,
} from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';

import { useEcoPoints } from '../hooks/useEcoPoints';
import { ecopointApi } from '../../../entities/map/api';
import type { EcoPoint, EcoPointDetail, EcoPointStatus } from '../../../entities/map/types';
import { CreateEcoPointModal } from './CreateEcoPointModel';
import UpdateEcoPointModal from './UpdateEcoPoinModal';

const statusOptions: EcoPointStatus[] = ['working', 'closed', 'temporarily_closed'];

const CENTER: LatLngExpression = [56.015, 92.89];
const ZOOM = 12;

type DetailTab = 'statuses' | 'reviews' | 'add-review';

type ApiErrorResponse = {
  detail?: string | Array<{ msg?: string } | string>;
  message?: string;
};

const markerIcon = L.divIcon({
  className: 'custom-emerald-marker',
  html: `
    <div style="
      width: 18px;
      height: 18px;
      background: #10b981;
      border: 2px solid #ffffff;
      border-radius: 9999px;
      box-shadow: 0 1px 5px rgba(16, 185, 129, 0.45);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const MapBlock = () => {
  const { points, loading, error } = useEcoPoints();
  const [search, setSearch] = useState('');
  const [expandedPointId, setExpandedPointId] = useState<number | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [fullPointCache, setFullPointCache] = useState<Record<number, EcoPoint>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPointForUpdate, setSelectedPointForUpdate] = useState<EcoPoint | null>(null);

  const [detailPointId, setDetailPointId] = useState<number | null>(null);
  const [detailPoint, setDetailPoint] = useState<EcoPointDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('statuses');
  const [selectedStatus, setSelectedStatus] = useState<EcoPointStatus>('working');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotoFile, setReviewPhotoFile] = useState<File | null>(null);
  const [reviewPhotoPreview, setReviewPhotoPreview] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const filteredPoints = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return points;
    return points.filter(
      (point) =>
        point.name.toLowerCase().includes(q) || point.address.toLowerCase().includes(q)
    );
  }, [points, search]);

  const visiblePoints = useMemo(() => {
    if (detailPointId === null) return filteredPoints;
    return filteredPoints.filter((point) => point.id === detailPointId);
  }, [filteredPoints, detailPointId]);

  const loadFullPoint = async (id: number): Promise<EcoPoint | null> => {
    if (fullPointCache[id]) return fullPointCache[id];

    try {
      const fullPoint = await ecopointApi.getById(id);
      setFullPointCache((prev) => ({ ...prev, [id]: fullPoint }));
      return fullPoint;
    } catch (err) {
      console.error('Ошибка загрузки полной точки:', err);
      return null;
    }
  };

  const toggleExpand = async (id: number) => {
    if (expandedPointId === id) {
      setExpandedPointId(null);
      return;
    }

    setExpandedPointId(id);
    await loadFullPoint(id);
  };

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
        return <ThumbsUp size={22} className="text-emerald-600" />;
      case 'closed':
        return <XCircle size={22} className="text-red-600" />;
      case 'temporarily_closed':
        return <CircleEllipsis size={22} className="text-amber-600" />;
      default:
        return null;
    }
  };

  const getUpdateSource = (point: EcoPoint | EcoPointDetail) => {
    const localDate = point.last_local_update_at ? new Date(point.last_local_update_at) : null;
    const recycleDate = point.recyclemap_updated_at ? new Date(point.recyclemap_updated_at) : null;

    if (!localDate && !recycleDate) return 'Неизвестно';
    if (!localDate) return 'RecycleMap';
    if (!recycleDate) return 'Экосистема Красноярска';

    return localDate > recycleDate ? 'Экосистема Красноярска' : 'RecycleMap';
  };

  const selectPoint = async (id: number) => {
    setDetailPointId(id);
    setDetailPoint(null);
    setExpandedPointId(id);
    await loadFullPoint(id);
  };

  const openDetail = async (id: number, tab: DetailTab = 'statuses') => {
    setDetailPointId(id);
    setDetailLoading(true);
    setDetailTab(tab);
    setStatusError(null);
    setReviewError(null);
    setReviewComment('');
    setReviewPhotoFile(null);
    setReviewPhotoPreview(null);

    try {
      const detail = await ecopointApi.getDetail(id);
      setDetailPoint(detail);
    } catch (err) {
      console.error('Ошибка загрузки деталей:', err);
      setDetailPoint(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async () => {
    if (!detailPointId) return;
    const detail = await ecopointApi.getDetail(detailPointId);
    setDetailPoint(detail);
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailPointId) return;

    setStatusSubmitting(true);
    setStatusError(null);

    try {
      await ecopointApi.addStatus(detailPointId, { status: selectedStatus });
      await refreshDetail();
      setDetailTab('statuses');
    } catch (err: unknown) {
      let message = 'Не удалось сохранить статус. Попробуйте позже.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiErrorResponse;
        if (typeof data?.detail === 'string') message = data.detail;
        else if (Array.isArray(data?.detail)) {
          message = data.detail
            .map((item) => (typeof item === 'string' ? item : item.msg || 'Ошибка'))
            .join('. ');
        } else if (typeof data?.message === 'string') {
          message = data.message;
        }
      }
      setStatusError(message);
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handlePhotoChange = (file: File | null) => {
    setReviewPhotoFile(file);
    if (reviewPhotoPreview) URL.revokeObjectURL(reviewPhotoPreview);
    setReviewPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailPointId) return;

    if (!reviewComment.trim()) {
      setReviewError('Введите текст отзыва');
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);

    try {
      let photoUrl: string | undefined;

      if (reviewPhotoFile) {
        const uploaded = await ecopointApi.uploadPhoto(reviewPhotoFile);
        photoUrl = uploaded.url;
      }

      await ecopointApi.addReview(detailPointId, {
        comment: reviewComment.trim(),
        photo_url: photoUrl,
      });

      setReviewComment('');
      handlePhotoChange(null);
      await refreshDetail();
      setDetailTab('reviews');
    } catch (err: unknown) {
      let message = 'Не удалось сохранить отзыв. Попробуйте позже.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiErrorResponse;
        if (typeof data?.detail === 'string') message = data.detail;
        else if (Array.isArray(data?.detail)) {
          message = data.detail
            .map((item) => (typeof item === 'string' ? item : item.msg || 'Ошибка'))
            .join('. ');
        } else if (typeof data?.message === 'string') {
          message = data.message;
        }
      }
      setReviewError(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const closeDetail = () => {
    setDetailPoint(null);
    setDetailTab('statuses');
    setStatusError(null);
    setReviewError(null);
    setReviewComment('');
    handlePhotoChange(null);
  };
  
  const backToList = () => {
    setDetailPointId(null);
    closeDetail();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="px-4 py-3 sticky top-0 z-50 bg-white border-b">
        <div className="flex gap-3 items-center">
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

          <button
            onClick={() => setShowCreateModal(true)}
            className="p-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div
        className={`relative transition-all duration-300 border-b ${
          isMapExpanded ? 'h-[55vh]' : 'h-[28vh]'
        }`}
      >
        <MapContainer
          center={CENTER}
          zoom={ZOOM}
          className="h-full w-full"
          zoomControl
          scrollWheelZoom
          wheelDebounceTime={120}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => selectPoint(point.id),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{point.name}</strong>
                  <br />
                  <span className="text-gray-600">{point.address}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <button
          onClick={() => setIsMapExpanded((prev) => !prev)}
          className="absolute bottom-4 right-4 z-1000 bg-white shadow-md rounded-full px-4 py-3 text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 transition-colors text-sm font-medium"
        >
          {isMapExpanded ? '↓ Свернуть карту' : '↑ Развернуть карту'}
        </button>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {loading && <div className="text-center py-12 text-gray-500">Загрузка точек...</div>}
        {error && <div className="bg-red-50 p-4 rounded-2xl text-red-600">{error}</div>}

        {detailPointId !== null && (
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4">
            <div>
              <h2 className="font-semibold text-base">
                {detailPoint?.name || 'Выбранная точка'}
              </h2>
              <p className="text-sm text-gray-500">Показана только одна точка</p>
            </div>

            <button
              type="button"
              onClick={backToList}
              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm"
            >
              Назад
            </button>
          </div>
        )}

        {visiblePoints.map((point) => {
          const isExpanded = expandedPointId === point.id;
          const fullPoint = fullPointCache[point.id] || null;
          const isSelected = detailPointId === point.id;

          return (
            <div
              key={point.id}
              className={`bg-white rounded-3xl shadow-sm border overflow-hidden ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-100'
              }`}
            >
              <div
                onClick={() => toggleExpand(point.id)}
                className="p-4 cursor-pointer active:bg-gray-50"
              >
                <h3 className="font-semibold text-lg leading-tight">{point.name}</h3>

                <p className="text-gray-600 text-sm mt-2 flex items-center gap-1.5">
                  <MapPin size={16} className="text-gray-400 shrink-0" />
                  <span>{point.address}</span>
                </p>

                {point.working_hours && (
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400 shrink-0" />
                    <span>{point.working_hours}</span>
                  </p>
                )}

                {point.types?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {point.types.map((type, index) => (
                      <span
                        key={`${type}-${index}`}
                        className={`text-xs px-3 py-1.5 rounded-2xl font-medium ${getTypeColor(type)}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {isExpanded && fullPoint && (
                <div className="p-4 space-y-4 border-t">
                  {fullPoint.description && (
                    <p className="text-gray-700 leading-relaxed text-sm">{fullPoint.description}</p>
                  )}

                  {fullPoint.contacts && Object.keys(fullPoint.contacts).length > 0 && (
                    <div className="flex flex-col gap-2">
                      {Object.entries(fullPoint.contacts).map(([key, value]) => {
                        if (!value) return null;

                        const href =
                          key === 'phone'
                            ? `tel:${value}`
                            : key === 'website'
                              ? String(value)
                              : key === 'vk'
                                ? String(value).startsWith('http')
                                  ? String(value)
                                  : `https://vk.com/${String(value).replace('@', '')}`
                                : key === 'max'
                                  ? `https://max.ru/${String(value).replace('@', '')}`
                                  : undefined;

                        return href ? (
                          <a
                            key={key}
                            href={href}
                            target={key === 'phone' ? undefined : '_blank'}
                            rel={key === 'phone' ? undefined : 'noreferrer'}
                            className="block text-emerald-600 hover:text-emerald-700 py-1 text-sm wrap-break-word"
                          >
                            {String(value)}
                          </a>
                        ) : (
                          <span key={key} className="text-sm text-gray-700 wrap-break-word">
                            {String(value)}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openDetail(point.id, 'statuses')}
                      className="flex items-center justify-center gap-3 bg-gray-50 p-3 rounded-2xl hover:bg-gray-100 active:bg-gray-200"
                    >
                      {getStatusIcon(fullPoint?.most_confirmed_status?.status || 'working')}
                      <div className="text-left">
                        <p className="text-xs font-medium">Статусы</p>
                        <p className="text-gray-600 text-xs">
                          {fullPoint?.most_confirmed_status?.confirmed_by || 0}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => openDetail(point.id, 'reviews')}
                      className="flex items-center justify-center gap-3 bg-gray-50 p-3 rounded-2xl hover:bg-gray-100 active:bg-gray-200"
                    >
                      <MessageCircle size={22} className="text-gray-500" />
                      <div className="text-left">
                        <p className="text-xs font-medium">Отзывы</p>
                        <p className="text-gray-600 text-xs">{fullPoint?.reviews_count ?? 0}</p>
                      </div>
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t space-y-1">
                    <div>
                      Обновлено:{' '}
                      {fullPoint?.last_local_update_at
                        ? new Date(fullPoint.last_local_update_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Нет данных'}
                    </div>

                    <div className="flex items-center gap-1">
                      Источник:{' '}
                      <span className="font-medium text-gray-700">
                        {fullPoint ? getUpdateSource(fullPoint) : 'Неизвестно'}
                      </span>
                    </div>

                    <div
                      className="pt-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => {
                        const pointToUpdate = fullPoint || point;
                        setSelectedPointForUpdate(pointToUpdate);
                        setIsUpdateModalOpen(true);
                      }}
                    >
                      <p className="text-emerald-600 flex items-center gap-2 hover:underline">
                        Есть более актуальные данные?
                        <span>📝</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {visiblePoints.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Ничего не найдено по вашему запросу
          </div>
        )}
      </div>

      {detailPointId !== null && detailPoint && (
        <div className="fixed inset-0 z-2000 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-2001">
            <div className="p-4 sm:p-5 border-b flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold wrap-break-word">
                  {detailPoint?.name || 'Эко-точка'}
                </h2>
                <div className="text-sm text-gray-500 mt-2 space-y-1">
                  {detailPoint?.address && (
                    <p className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{detailPoint.address}</span>
                    </p>
                  )}
                  {detailPoint?.working_hours && (
                    <p className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{detailPoint.working_hours}</span>
                    </p>
                  )}
                </div>
              </div>

              <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X size={26} />
              </button>
            </div>

            <div className="px-4 sm:px-5 pt-4 border-b">
              <div className="flex gap-2 overflow-x-auto pb-3">
                <button
                  onClick={() => setDetailTab('statuses')}
                  className={`px-3 py-2 rounded-2xl text-sm font-medium whitespace-nowrap ${
                    detailTab === 'statuses'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Статусы
                </button>
                <button
                  onClick={() => setDetailTab('reviews')}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap ${
                    detailTab === 'reviews'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Отзывы
                </button>
                <button
                  onClick={() => setDetailTab('add-review')}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap ${
                    detailTab === 'add-review'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Оставить отзыв
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-5">
              {detailLoading && <div className="text-center py-10 text-gray-500">Загрузка...</div>}

              {!detailLoading && detailPoint && (
                <>
                  {detailTab === 'statuses' && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {statusOptions.map((status) => {
                          const summary =
                            detailPoint.statuses_summary?.find((s) => s.status === status) || {
                              status,
                              confirmed_by: 0,
                            };

                          return (
                            <div
                              key={status}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
                            >
                              <div className="flex items-center gap-3">
                                {getStatusIcon(status)}
                                <span className="font-medium capitalize">
                                  {status === 'working'
                                    ? 'Работает'
                                    : status === 'closed'
                                      ? 'Закрыта'
                                      : 'Временно закрыта'}
                                </span>
                              </div>
                              <span className="font-semibold text-xl text-emerald-600">
                                {summary.confirmed_by}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <form onSubmit={handleAddStatus} className="space-y-3 pt-2 border-t">
                        <label className="block text-sm font-medium mb-2">Поставить статус</label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {statusOptions.map((status) => (
                            <label
                              key={status}
                              className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer ${
                                selectedStatus === status
                                  ? 'border-emerald-600 bg-emerald-50'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="status"
                                checked={selectedStatus === status}
                                onChange={() => setSelectedStatus(status)}
                              />
                              <span className="text-sm">
                                {status === 'working'
                                  ? 'Работает'
                                  : status === 'closed'
                                    ? 'Закрыта'
                                    : 'Временно закрыта'}
                              </span>
                            </label>
                          ))}
                        </div>

                        {statusError && (
                          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm">
                            {statusError}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={statusSubmitting}
                          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-2xl font-medium"
                        >
                          {statusSubmitting ? 'Отправляем...' : 'Сохранить статус'}
                        </button>
                      </form>
                    </div>
                  )}

                  {detailTab === 'reviews' && (
                    <div className="space-y-5">
                      <p className="text-sm font-medium text-gray-500">
                        Отзывы ({detailPoint.reviews_count})
                      </p>

                      {detailPoint.reviews.length > 0 ? (
                        <div className="space-y-5">
                          {detailPoint.reviews.map((review) => (
                            <div key={review.id} className="border-b pb-5 last:border-none last:pb-0">
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <p className="font-medium text-gray-800">
                                  {review.user_name || `Пользователь #${review.user_id}`}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>

                              <p className="text-gray-700 leading-relaxed text-sm">
                                {review.comment}
                              </p>

                              {review.photo_url && (
                                <img
                                  src={review.photo_url}
                                  alt="Фото к отзыву"
                                  className="mt-4 rounded-2xl w-full max-h-72 object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-10 text-gray-500">Пока нет отзывов</p>
                      )}
                    </div>
                  )}

                  {detailTab === 'add-review' && (
                    <form onSubmit={handleAddReview} className="space-y-4 max-w-xl">
                      <div>
                        <label className="block text-sm font-medium mb-2">Комментарий</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500 h-32"
                          placeholder="Напишите отзыв о точке..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Фото</label>
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="w-full py-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-gray-700 flex items-center justify-center gap-2"
                        >
                          <ImagePlus size={18} />
                          {reviewPhotoFile ? 'Заменить фото' : 'Загрузить фото'}
                        </button>

                        {reviewPhotoPreview && (
                          <div className="mt-3 relative">
                            <img
                              src={reviewPhotoPreview}
                              alt="Предпросмотр"
                              className="w-full max-h-72 object-cover rounded-2xl"
                            />
                            <button
                              type="button"
                              onClick={() => handlePhotoChange(null)}
                              className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {reviewError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm">
                          {reviewError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-2xl font-medium"
                      >
                        {reviewSubmitting ? 'Отправляем...' : 'Опубликовать отзыв'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateEcoPointModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <UpdateEcoPointModal
        key={selectedPointForUpdate?.id ?? 'update-modal'}
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedPointForUpdate(null);
        }}
        ecoPoint={selectedPointForUpdate}
        onSuccess={() => {
          setIsUpdateModalOpen(false);
          setSelectedPointForUpdate(null);
        }}
      />
    </div>
  );
};

export default MapBlock;