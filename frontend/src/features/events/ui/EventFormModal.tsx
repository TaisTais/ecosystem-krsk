import { useMemo, useState } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';

import type { EventRead, EventStatus } from '../../../entities/events/types';
import { eventsApi } from '../../../entities/events/api';
import axios from 'axios';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    const handleStartChange = (date: Date | undefined) => {
    if (!date) return;

    // Если время ещё не выбрано — ставим текущее или разумное дефолтное
    const currentTime = form.start_datetime 
      ? form.start_datetime.slice(11, 16) 
      : '12:00'; // можно поменять на '09:00' или оставить ''

    setForm(prev => ({
      ...prev,
      start_datetime: `${date.toISOString().slice(0, 10)}T${currentTime}`,
    }));
  };

  const handleEndChange = (date: Date | undefined) => {
    if (!date) return;

    const currentTime = form.end_datetime 
      ? form.end_datetime.slice(11, 16) 
      : '13:00'; // +1 час от начала или просто 13:00

    setForm(prev => ({
      ...prev,
      end_datetime: `${date.toISOString().slice(0, 10)}T${currentTime}`,
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!form.title.trim()) throw new Error('Название обязательно');
      if (!form.start_datetime) throw new Error('Укажите дату начала');
      if (!form.end_datetime) throw new Error('Укажите дату окончания');

      const startDate = new Date(form.start_datetime);
      const endDate = new Date(form.end_datetime);

      if (isNaN(startDate.getTime())) throw new Error('Неверная дата начала');
      if (isNaN(endDate.getTime())) throw new Error('Неверная дата окончания');
      if (endDate <= startDate) throw new Error('Дата окончания должна быть позже начала');

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
        is_online: form.is_online,
        address: form.is_online ? null : (form.address.trim() || null),
        meeting_link: form.is_online ? (form.meeting_link.trim() || null) : null,
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
      if (err instanceof Error) message = err.message;
      else if (axios.isAxiosError(err)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = err.response?.data as any;
        message = data?.detail || data?.message || message;
      }
      setError(message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-semibold text-xl">
            {isEdit ? 'Редактировать событие' : 'Создать событие'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-5 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Название</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Субботник у Енисея"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 min-h-32"
              placeholder="Подробное описание..."
            />
          </div>

          {/* Даты — shadcn календарь */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Дата и время начала</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-2xl h-12 border border-emerald-200 bg-emerald-50/60 hover:bg-white",
                      !form.start_datetime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.start_datetime ? (
                      format(new Date(form.start_datetime), "dd MMMM yyyy, HH:mm", { locale: ru })
                    ) : (
                      <span>Выберите дату и время начала</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
  className="w-auto p-0 z-200" 
  align="start"
  sideOffset={8}
>
  <Calendar
    mode="single"
    selected={form.start_datetime ? new Date(form.start_datetime) : undefined}
    onSelect={handleStartChange}
    locale={ru}
  />
  <div className="p-3 border-t border-gray-100">
    <input
      type="time"
      value={form.start_datetime ? form.start_datetime.slice(11, 16) : ''}
      onChange={(e) => {
        if (form.start_datetime) {
          const datePart = form.start_datetime.slice(0, 10);
          setForm(prev => ({
            ...prev,
            start_datetime: `${datePart}T${e.target.value}`,
          }));
        }
      }}
      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
    />
  </div>
</PopoverContent>
              </Popover>
            </div>

                        <div>
              <label className="block text-sm font-medium mb-2">Дата и время окончания</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-2xl h-12 border border-emerald-200 bg-emerald-50/60 hover:bg-white",
                      !form.end_datetime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.end_datetime ? (
                      format(new Date(form.end_datetime), "dd MMMM yyyy, HH:mm", { locale: ru })
                    ) : (
                      <span>Выберите дату и время окончания</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 z-200" 
                  align="start"
                  sideOffset={8}
                >
                  <Calendar
                    mode="single"
                    selected={form.end_datetime ? new Date(form.end_datetime) : undefined}
                    onSelect={handleEndChange}
                    locale={ru}
                  />
                  <div className="p-3 border-t border-gray-100">
                    <input
                      type="time"
                      value={form.end_datetime ? form.end_datetime.slice(11, 16) : ''}
                      onChange={(e) => {
                        if (form.end_datetime) {
                          const datePart = form.end_datetime.slice(0, 10);
                          setForm(prev => ({
                            ...prev,
                            end_datetime: `${datePart}T${e.target.value}`,
                          }));
                        }
                      }}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Остальные поля */}
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
                placeholder="пр. Мира, 10"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Ссылка на встречу</label>
              <input
                value={form.meeting_link}
                onChange={(e) => setForm((p) => ({ ...p, meeting_link: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="https://..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Макс. участников</label>
            <input
              type="number"
              value={form.max_people}
              onChange={(e) => setForm((p) => ({ ...p, max_people: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Неограниченно"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Теги</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="экология, уборка, волонтёры"
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
            className="w-full rounded-2xl bg-emerald-600 text-white py-3.5 font-medium disabled:bg-gray-400"
          >
            {submitting ? 'Сохраняем...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;