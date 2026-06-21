import axios from 'axios';
import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ecopointApi } from '../../../entities/map/api';
import type { EcoPointCreate, EcoPointCategory } from '../../../entities/map/types';
import { useAuth } from '@/app/context/AuthContext';

const availableCategories: { value: EcoPointCategory; label: string }[] = [
  { value: 'PLASTIC', label: 'Пластик' },
  { value: 'PAPER', label: 'Макулатура' },
  { value: 'GLASS', label: 'Стекло' },
  { value: 'METAL', label: 'Металл' },
  { value: 'BATTERIES', label: 'Батарейки' },
  { value: 'CLOTHES', label: 'Одежда' },
  { value: 'ELECTRONICS', label: 'Электроника' },
  { value: 'HAZARDOUS', label: 'Опасные отходы' },
  { value: 'OTHER', label: 'Другое' },
  { value: 'OWN_TARA', label: 'Своя тара' },
];

type CreateEcoPointModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const emptyContacts = {
  phone: '',
  email: '',
  website: '',
  vk: '',
  max: '',
};

export const CreateEcoPointModal = ({ isOpen, onClose }: CreateEcoPointModalProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<EcoPointCreate>>({
    types: [],
    contacts: emptyContacts,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isOpen && !isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-6">🔒</div>
          <h2 className="text-2xl font-semibold mb-3">Войдите в аккаунт</h2>
          <p className="text-gray-600 mb-8">
            Чтобы добавить новую эко-точку, нужно быть авторизованным.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-medium mb-3"
          >
            Понятно
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/profile', { replace: true });
            }}
            className="w-full py-3.5 border border-emerald-600 text-emerald-600 rounded-2xl font-medium"
          >
            Перейти ко входу
          </button>
        </div>
      </div>
    );
  }

  const handleTypeChange = (cat: EcoPointCategory, checked: boolean) => {
    const current = (formData.types ?? []) as EcoPointCategory[];

    const nextTypes: EcoPointCategory[] = checked
      ? cat === 'OWN_TARA'
        ? ['OWN_TARA' as EcoPointCategory]
        : [...current.filter((t) => t !== 'OWN_TARA'), cat]
      : current.filter((t) => t !== cat);

    setFormData({ ...formData, types: nextTypes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name?.trim()) {
      setErrorMessage('Введите название точки');
      return;
    }
    if (!formData.address?.trim()) {
      setErrorMessage('Введите адрес точки');
      return;
    }
    if (formData.latitude === undefined || formData.longitude === undefined) {
      setErrorMessage('Укажите координаты точки');
      return;
    }
    if (!formData.types || formData.types.length === 0) {
      setErrorMessage('Выберите хотя бы один тип отходов');
      return;
    }

    setLoading(true);

    try {
      const { contacts, ...rest } = formData;
      const cleanContacts = contacts
        ? Object.fromEntries(
            Object.entries(contacts).filter(([, value]) => typeof value === 'string' && value.trim() !== '')
          )
        : {};

      const dataToSend: Partial<EcoPointCreate> = {
        ...rest,
        contacts: Object.keys(cleanContacts).length ? cleanContacts : undefined,
        types: formData.types.map((t) => t.toLowerCase() as EcoPointCategory),
      };

      await ecopointApi.create(dataToSend);
      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Ошибка при создании точки:', err);
        
      let message = 'Не удалось отправить заявку. Попробуйте позже.';
        
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data as {
          detail?: string | Array<{ msg?: string } | string>;
          message?: string;
        };
      
        if (status === 401) {
          message = 'Вы не авторизованы. Пожалуйста, войдите в аккаунт.';
        } else if (status === 422) {
          if (Array.isArray(data?.detail)) {
            message = data.detail
              .map((item) => (typeof item === 'string' ? item : item.msg || 'Ошибка валидации'))
              .join('. ');
          } else if (typeof data?.detail === 'string') {
            message = data.detail;
          } else {
            message = 'Проверьте правильность заполнения полей.';
          }
        } else if (typeof data?.detail === 'string') {
          message = data.detail;
        } else if (typeof data?.message === 'string') {
          message = data.message;
        }
      }
    
      setErrorMessage(message);
    }finally {
          setLoading(false);
        }
      };

  const resetAndClose = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setFormData({ types: [], contacts: emptyContacts });
    onClose();
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-6">📬</div>
          <h2 className="text-2xl font-semibold mb-3">Заявка отправлена</h2>
          <p className="text-gray-600 mb-8">
            Спасибо! Ваша заявка на добавление эко-точки отправлена на модерацию.
          </p>
          <button
            onClick={resetAndClose}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  const selectedTypes = formData.types || [];
  const isOwnTaraSelected = selectedTypes.includes('OWN_TARA' as EcoPointCategory);
  const hasOtherTypesSelected = selectedTypes.some((t) => t !== 'OWN_TARA');

  return (
    <div className="fixed inset-0 z-100 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-101">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Добавить новую эко-точку</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={26} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Название точки *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
              placeholder="Пункт приёма на Свободном"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Адрес *</label>
            <input
              type="text"
              required
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
              placeholder="Красноярск, пр. Свободный, 76к"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Принимаемые отходы *</label>
            <div className="grid grid-cols-2 gap-2 pr-2">
              {availableCategories.map((cat) => {
                const isDisabled =
                  (cat.value === 'OWN_TARA' && hasOtherTypesSelected) ||
                  (cat.value !== 'OWN_TARA' && isOwnTaraSelected);

                return (
                  <label
                    key={cat.value}
                    className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded-xl cursor-pointer ${
                      isDisabled ? 'opacity-40 pointer-events-none' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(cat.value)}
                      onChange={(e) => handleTypeChange(cat.value, e.target.checked)}
                      disabled={isDisabled}
                    />
                    <span>{cat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Координаты *</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={formData.latitude || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                  placeholder="Широта"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={formData.longitude || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: parseFloat(e.target.value) || undefined,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                  placeholder="Долгота"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                alert('Функция автозаполнения координат по адресу будет доступна в ближайшее время.')
              }
              className="mt-3 w-full py-3 text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <MapPin size={18} />
              Определить координаты по адресу
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Часы работы</label>
            <input
              type="text"
              value={formData.working_hours || ''}
              onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
              placeholder="Пн-Пт 09:00-19:00, Сб 10:00-16:00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500 h-24"
              placeholder="Принимаем пластик, стекло, батарейки..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Контакты</label>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                value={formData.contacts?.phone || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contacts: { ...(formData.contacts || {}), phone: e.target.value },
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="Телефон"
              />
              <input
                type="email"
                value={formData.contacts?.email || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contacts: { ...(formData.contacts || {}), email: e.target.value },
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="Email"
              />
              <input
                type="text"
                value={formData.contacts?.website || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contacts: { ...(formData.contacts || {}), website: e.target.value },
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="Сайт"
              />
              <input
                type="text"
                value={formData.contacts?.vk || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contacts: { ...(formData.contacts || {}), vk: e.target.value },
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="VK"
              />
              <input
                type="text"
                value={formData.contacts?.max || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contacts: { ...(formData.contacts || {}), max: e.target.value },
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="Max"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-2xl font-medium text-base transition-colors"
          >
            {loading ? 'Отправляем заявку...' : 'Отправить на модерацию'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEcoPointModal;