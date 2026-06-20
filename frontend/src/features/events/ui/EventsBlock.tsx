import { useMemo, useState } from 'react';
import type { EventRead } from '../../../entities/events/types';
import EventCard from './EventCard';
import EventFormModal from './EventFormModal';
import EventsHeader from './EventsHeader';
import { useEventsCalendar } from '../hooks/useEventsCalendar';

const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' })
    .format(date)
    .replace(/^./, (c) => c.toUpperCase());

const pad2 = (n: number) => String(n).padStart(2, '0');

const localDayKey = (value: Date | string) => {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const hasPlaces = (event: { participants_count?: number; max_people?: number | null }) => {
  if (event.max_people == null) return true;
  return (event.participants_count ?? 0) < event.max_people;
};

const EventsBlock = () => {
  const [cursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventRead | null>(null);

  const startOfMonth = useMemo(() => {
    const d = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [cursor]);

  const endOfMonth = useMemo(() => {
    const d = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
    return d;
  }, [cursor]);

  const days = useMemo(() => {
    const first = new Date(startOfMonth);
    const shift = (first.getDay() + 6) % 7;
    first.setDate(first.getDate() - shift);

    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date(first);
      d.setDate(first.getDate() + i);
      return d;
    });
  }, [startOfMonth]);

  const todayKey = useMemo(() => localDayKey(new Date()), []);

  const { events, loading, error, refetch } = useEventsCalendar({
    startDate: startOfMonth.toISOString(),
    endDate: endOfMonth.toISOString(),
  });

  const groupedByDay = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const ev of events) {
      const key = localDayKey(ev.start_datetime);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.start_datetime);
      return d >= startOfMonth && d <= endOfMonth;
    });
  }, [events, startOfMonth, endOfMonth]);

  const activeList = useMemo(() => {
    if (!selectedDay) return monthEvents;
    return monthEvents.filter((e) => localDayKey(e.start_datetime) === selectedDay);
  }, [monthEvents, selectedDay]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <EventsHeader
        monthLabel={monthLabel(cursor)}
        onCreate={() => {
          setEditEvent(null);
          setModalOpen(true);
        }}
      />

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="grid grid-cols-7 gap-2 text-left text-xs text-gray-500 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="px-1 py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const key = localDayKey(day);
              const inMonth = day.getMonth() === cursor.getMonth();
              const dayEvents = groupedByDay.get(key) ?? [];
              const isSelected = selectedDay === key;
              const isToday = key === todayKey;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay((prev) => (prev === key ? null : key))}
                  className={`min-h-24 rounded-2xl border p-2 text-left transition ${
                    isToday ? 'bg-emerald-50' : inMonth ? 'bg-white' : 'bg-gray-50 text-gray-300'
                  } ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-100'}`}
                >
                  <div className="flex items-start justify-start">
                    <span className={`text-xs font-medium ${inMonth ? 'text-gray-900' : 'text-gray-300'}`}>
                      {day.getDate()}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-1.5 justify-start">
                    {dayEvents.map((e) => (
                      <span
                        key={e.id}
                        title={e.title}
                        className={`h-2.5 w-2.5 rounded-full ${
                          hasPlaces(e) ? 'bg-emerald-500' : 'bg-lime-400'
                        }`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {selectedDay ? 'События дня' : 'События месяца'}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedDay ? 'Нажми “Назад”, чтобы вернуться к месяцу' : 'Краткий список событий'}
            </p>
          </div>

          {selectedDay && (
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-sm px-3 py-2 rounded-xl bg-white border border-gray-200"
            >
              Назад
            </button>
          )}
        </div>

        {error && (
          <div className="bg-white rounded-2xl p-6 text-center text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-500">Загрузка...</div>
        ) : (
          <div className="space-y-4">
            {activeList.map((event) => (
              <EventCard
                key={event.id}
                event={event as EventRead}
                currentUserRole={null}
                onRefresh={refetch}
                onOpenEdit={(ev) => {
                  setEditEvent(ev);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <EventFormModal
          key={editEvent?.id ?? 'create'}
          isOpen={modalOpen}
          mode={editEvent ? 'edit' : 'create'}
          initialEvent={editEvent}
          onClose={() => {
            setModalOpen(false);
            setEditEvent(null);
          }}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default EventsBlock;