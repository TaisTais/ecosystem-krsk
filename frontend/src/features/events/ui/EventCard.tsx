import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, CalendarDays, MapPin, Link2} from 'lucide-react';
import axios from 'axios';

import type { EventRead } from '../../../entities/events/types';
import { eventsApi } from '../../../entities/events/api';
import EventActionsMenu from './EventActionsMenu';

type Props = {
  event: EventRead;
  currentUserRole?: string | null;
  onRefresh: () => void;
  onOpenEdit: (event: EventRead) => void;
};

const statusLabel: Record<EventRead['status'], string> = {
  active: 'Активно',
  cancelled: 'Отменено',
  finished: 'Завершено',
  full: 'Заполнено',
};

const statusClass: Record<EventRead['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
  finished: 'bg-gray-100 text-gray-700',
  full: 'bg-amber-50 text-amber-700',
};

const EventCard = ({ event, currentUserRole, onRefresh, onOpenEdit }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const canEdit = currentUserRole === 'moderator' || currentUserRole === 'admin';

  const dateLabel = useMemo(() => {
    const d = new Date(event.start_datetime);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }, [event.start_datetime]);

  const timeRange = useMemo(() => {
    const start = new Date(event.start_datetime);
    const end = event.end_datetime ? new Date(event.end_datetime) : null;
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(d);
    return end ? `${fmt(start)}–${fmt(end)}` : fmt(start);
  }, [event.start_datetime, event.end_datetime]);

  const actionLabel = useMemo(() => {
  if (event.is_user_applicant) {
    return event.status === 'finished' ? 'Подтвердить участие' : 'Отменить заявку';
  }
  return 'Записаться';
}, [event.is_user_applicant, event.status]);

  const handleAction = async () => {
  setLoading(true);
  try {
    if (event.is_user_applicant) {
      // Уже подавал заявку → отменяем
      await eventsApi.cancelApplication(event.id);
    } else {
      // Подаём заявку
      await eventsApi.applyToEvent(event.id);
    }
    
    onRefresh(); // ← это самое важное
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(err.response?.data);
      // Можно добавить toast с ошибкой
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-emerald-600 text-sm font-medium">{dateLabel}</p>
            <h3 className="font-semibold text-lg mt-1">{event.title}</h3>
          </div>

          <div className="flex items-start gap-2 shrink-0">
            <span className={`inline-block text-xs px-3 py-1 rounded-full ${statusClass[event.status]}`}>
              {statusLabel[event.status]}
            </span>
            <EventActionsMenu
              canEdit={canEdit}
              onEdit={() => onOpenEdit(event)}
              onDelete={() => {}}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={16} />
            {timeRange}
          </span>
          {event.is_online ? (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Link2 size={16} />
                Онлайн
              </span>
            </>
          ) : event.address ? (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={16} />
                {event.address}
              </span>
            </>
          ) : null}
        </div>

        {event.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600"
          >
            {expanded ? (
              <>
                Свернуть <ChevronUp size={16} />
              </>
            ) : (
              <>
                Подробнее <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            {event.invitation_post_url && (
              <a
                href={event.invitation_post_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
              >
                Открыть пост-приглашение
              </a>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAction}
                disabled={loading}
                className="rounded-2xl bg-emerald-600 text-white px-4 py-2 text-sm font-medium disabled:bg-gray-400"
              >
                {loading ? '...' : actionLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default EventCard;