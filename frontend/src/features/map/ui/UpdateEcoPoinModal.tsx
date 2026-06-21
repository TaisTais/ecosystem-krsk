import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import type { EcoPoint, EcoPointUpdate, EcoPointCategory } from '../../../entities/map/types';
import { ecopointApi } from '../../../entities/map/api';

interface UpdateEcoPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  ecoPoint: EcoPoint | null;
  onSuccess?: () => void;
}

const availableCategories: Array<{ value: EcoPointCategory; label: string }> = [
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

const getInitialFormData = (ecoPoint: EcoPoint | null): Partial<EcoPointUpdate> => {
  if (!ecoPoint) return {};

  return {
    name: ecoPoint.name,
    address: ecoPoint.address,
    latitude: ecoPoint.latitude,
    longitude: ecoPoint.longitude,
    types: ecoPoint.types,
    description: ecoPoint.description,
    working_hours: ecoPoint.working_hours,
    contacts: ecoPoint.contacts || {
      phone: '',
      email: '',
      website: '',
      vk: '',
      max: '',
    },
  };
};

const UpdateEcoPointModal: React.FC<UpdateEcoPointModalProps> = ({
  isOpen,
  onClose,
  ecoPoint,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<EcoPointUpdate>>(() => getInitialFormData(ecoPoint));
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedTypes = formData.types || [];
  const isOwnTaraSelected = selectedTypes.includes('OWN_TARA' as EcoPointCategory);
  const hasOtherTypesSelected = selectedTypes.some((t) => t !== 'OWN_TARA');

  const handleTypeChange = (cat: EcoPointCategory, checked: boolean) => {
    const current = formData.types || [];
    let newTypes: EcoPointCategory[] = [];

    if (checked) {
      if (cat === 'OWN_TARA') {
        newTypes = ['OWN_TARA'];
      } else {
        newTypes = [...current.filter((t) => t !== 'OWN_TARA'), cat];
      }
    } else {
      newTypes = current.filter((t) => t !== cat);
    }

    setFormData((prev) => ({ ...prev, types: newTypes }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ecoPoint) return;

    setErrorMessage(null);

    if (Object.keys(formData).length === 0) {
      setErrorMessage('Измените хотя бы одно поле');
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

      const dataToSend: Partial<EcoPointUpdate> = {
        ...rest,
        contacts: Object.keys(cleanContacts).length ? cleanContacts : undefined,
        types: formData.types?.map((t) => String(t).toLowerCase() as EcoPointCategory),
      };

      await ecopointApi.update(ecoPoint.id, dataToSend);
      setSubmitted(true);
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
      };

      setErrorMessage(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Не удалось отправить обновление. Попробуйте позже.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen || !ecoPoint) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-101">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Обновить эко-точку</h2>
            <p className="text-sm text-gray-500 mt-1">{ecoPoint.name}</p>
          </div>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600">
            <X size={26} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h3 className="text-2xl font-semibold mb-3">Изменения сохранены</h3>
            <p className="text-gray-600 mb-8">
              Спасибо! Данные эко-точки успешно обновлены.
            </p>
            <button
              onClick={resetAndClose}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Название точки *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
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
                        className="accent-emerald-600"
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
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={formData.latitude ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      latitude: e.target.value === '' ? undefined : parseFloat(e.target.value),
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                  placeholder="Широта"
                />
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={formData.longitude ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      longitude: e.target.value === '' ? undefined : parseFloat(e.target.value),
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                  placeholder="Долгота"
                />
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
                onChange={(e) => setFormData((prev) => ({ ...prev, working_hours: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
                placeholder="Пн-Пт 09:00-19:00, Сб 10:00-16:00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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
              {loading ? 'Сохраняем...' : 'Сохранить изменения'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateEcoPointModal;