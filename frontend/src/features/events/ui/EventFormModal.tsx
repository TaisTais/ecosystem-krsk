import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

import type { EventRead, EventStatus } from '../../../entities/events/types';
import { eventsApi } from '../../../entities/events/api';

type Props = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialEvent?: EventRead | null;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  is_online: boolean;
  address: string;
  meeting_link: string;
  max_people: string;
  tags: string;
  status: EventStatus;
};

const emptyState = (): FormState => ({
  title: '',
  description: '',
  start_datetime: '',
  end_datetime: '',
  is_online: false,
  address: '',
  meeting_link: '',
  max_people: '',
  tags: '',
  status: 'active',
});

const fromEvent = (event: EventRead): FormState => ({
  title: event.title ?? '',
  description: event.description ?? '',
  start_datetime: event.start_datetime ? event.start_datetime.slice(0, 16) : '',
  end_datetime: event.end_datetime ? event.end_datetime.slice(0, 16) : '',
  is_online: event.is_online,
  address: event.address ?? '',
  meeting_link: event.meeting_link ?? '',
  max_people: event.max_people?.toString() ?? '',
  tags: event.tags?.join(', ') ?? '',
  status: event.status,
});

const EventFormModal = ({ isOpen, mode, initialEvent, onClose, onSuccess }: Props) => {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState<FormState>(() => {
    if (isEdit && initialEvent) return fromEvent(initialEvent);
    return emptyState();
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLabel = useMemo(
    () => (isEdit ? 'Сохранить изменения' : 'Создать событие'),
    [isEdit]
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        start_datetime: new Date(form.start_datetime).toISOString(),
        end_datetime: new Date(form.end_datetime).toISOString(),
        is_online: form.is_online,
        address: form.is_online ? null : form.address.trim() || null,
        meeting_link: form.is_online ? form.meeting_link.trim() || null : null,
        max_people: form.max_people ? Number(form.max_people) : null,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: form.status,
      };

      if (isEdit && initialEvent) {
        await eventsApi.updateEvent(initialEvent.id, payload);
      } else {
        await eventsApi.createEvent(payload);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      let message = 'Не удалось сохранить событие.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { detail?: string; message?: string };
        message = data?.detail || data?.message || message;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 border-b flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg sm:text-xl">
              {isEdit ? 'Редактировать событие' : 'Создать событие'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-auto">
          <div>
            <label className="block text-sm font-medium mb-2">Название</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 min-h-36"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Начало</label>
              <input
                type="datetime-local"
                value={form.start_datetime}
                onChange={(e) => setForm((p) => ({ ...p, start_datetime: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Конец</label>
              <input
                type="datetime-local"
                value={form.end_datetime}
                onChange={(e) => setForm((p) => ({ ...p, end_datetime: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
            <input
              type="checkbox"
              checked={form.is_online}
              onChange={(e) => setForm((p) => ({ ...p, is_online: e.target.checked }))}
            />
            <span className="text-sm font-medium">Онлайн-мероприятие</span>
          </label>

          {!form.is_online ? (
            <div>
              <label className="block text-sm font-medium mb-2">Адрес</label>
              <input
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Ссылка на встречу</label>
              <input
                value={form.meeting_link}
                onChange={(e) => setForm((p) => ({ ...p, meeting_link: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Макс. участников</label>
            <input
              value={form.max_people}
              onChange={(e) => setForm((p) => ({ ...p, max_people: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Теги</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="экология, уборка"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as EventStatus }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 bg-white"
            >
              <option value="active">Активно</option>
              <option value="cancelled">Отменено</option>
              <option value="finished">Прошло</option>
              <option value="full">Заполнено</option>
            </select>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 text-red-600 p-4 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-medium disabled:bg-gray-400"
          >
            {submitting ? 'Сохраняем...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;