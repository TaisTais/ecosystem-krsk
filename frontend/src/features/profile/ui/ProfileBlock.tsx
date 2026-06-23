/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Calendar, Pen, Stamp, Trophy, UserCog, ArrowRight} from 'lucide-react';

import EventCard from '../../events/ui/EventCard';
import { AccountContent } from './AccountContent';
import AchievementCard from '../../achievements/ui/AchievementCard';
import EventFormModal from '../../events/ui/EventFormModal';

import { useMyProfile } from '../hooks/useMyProfile';
import { useMyAchievements } from '../hooks/useMyAchievements';
import { useMyEvents } from '../hooks/useMyEvents';
import { useMyModerations } from '../hooks/useMyModerations';
import { useMyComplaints } from '../hooks/useMyComplaints';
import type { EventRead } from '@/entities/events/types';
import type { ModerationRecordRead, UserRole } from '../../../entities/profile/types';
import type { ComplaintRead, TargetType } from '@/entities/complaints/types';
import ComplaintFormModal from './ComplaintFormModal';

const roleLabels: Record<UserRole, string> = {
  citizen: 'Житель',
  moderator: 'Модератор',
  organization: 'Организация',
  admin: 'Администратор',
};

type Props = {
  fullName: string;
  role: UserRole;
  points?: number;
  achievementsCount?: number;
  eventsCount?: number;
};

const ProfileGreenHeader = ({ fullName, role, points, achievementsCount, eventsCount }: Props) => {
  return (
    <div className="bg-linear-to-br from-emerald-600 via-[#4ca78a] to-[#81e4b1] text-white px-5 pt-10 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-15">
        <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-lime-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="min-w-0">
              <h1 className="text-3xl font-medium leading-tight text-lime-100 wrap-break-word">
                {fullName || 'Дорогой друг'}
              </h1>
              <p className="text-emerald-100 mt-1 text-sm">{roleLabels[role]}</p>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <img
            src="/assets/images/forest.png"
            alt=""
            className="h-27 w-auto"
          />
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/12 backdrop-blur px-3 py-3 border border-white/15">
          <div className="text-[11px] text-emerald-50/90">Баллы</div>
          <div className="mt-1 text-lg font-semibold">{points ?? 0}</div>
        </div>
        <div className="rounded-2xl bg-white/12 backdrop-blur px-3 py-3 border border-white/15">
          <div className="text-[11px] text-emerald-50/90">Достижения</div>
          <div className="mt-1 text-lg font-semibold">{achievementsCount ?? 0}</div>
        </div>
        <div className="rounded-2xl bg-white/12 backdrop-blur px-3 py-3 border border-white/15">
          <div className="text-[11px] text-emerald-50/90">События</div>
          <div className="mt-1 text-lg font-semibold">{eventsCount ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

const ProfileBlock = () => {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRead | null>(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [complaintTarget, setComplaintTarget] = useState<{
  type: TargetType;
  id: number;
  title?: string;
} | null>(null);

  const { data: profile, loading: profileLoading, error: profileError } = useMyProfile();
  const { data: achievementsData, loading: achievementsLoading } = useMyAchievements();
  const { data: eventsData, loading: eventsLoading, refetch: refetchEvents } = useMyEvents();
  const { data: moderationsData, loading: moderationsLoading } = useMyModerations();
const { data: complaintsData, loading: complaintsLoading, refetch: refetchComplaints } = useMyComplaints();


  const toggleBlock = (id: string) => {
    setExpandedBlock(expandedBlock === id ? null : id);
  };

  const handleOpenEditEvent = (event: any) => {
    setEditingEvent(event as EventRead);
    setIsEventModalOpen(true);
  };

  const handleEventSuccess = () => {
    refetchEvents?.();
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };
  const handleOpenComplaint = (
  targetType: TargetType,
  targetId: number,
  targetTitle?: string
) => {
  setComplaintTarget({ type: targetType, id: targetId, title: targetTitle });
  setIsComplaintModalOpen(true);
};

  const handleComplaintSuccess = () => {
    refetchComplaints?.();
    setIsComplaintModalOpen(false);
    setComplaintTarget(null);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center text-gray-500">
        Загрузка профиля...
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center text-red-600">
        Ошибка загрузки профиля
      </div>
    );
  }

  const getActionLabel = (action: string): string => {
  switch (action) {
    case 'add_point': return 'Добавление эко-точки';
    case 'update_point': return 'Обновление точки';
    case 'participate_event': return 'Подтверждение участия в событии';
    case 'organize_event': return 'Проведение мероприятия';
    case 'set_status': return 'Обновление статуса точки';
    case 'write_review': return 'Написание отзыва';
    default: return action;
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending': return 'На рассмотрении';
    case 'approved': return 'Одобрено';
    case 'rejected': return 'Отклонено';
    default: return status;
  }
};

const getTargetLabel = (type: string, target_name: string | null): string => {
  switch (type) {
    case 'user':
      return `На пользователя ${target_name}`;
    case 'event':
      return `На событие ${target_name}`;
    case 'content':
      return `На публикацию ${target_name}`;
    case 'comment':
      return `На комментарий ${target_name}`;
    default:
      return `На ${type} ${target_name}`;
  }
};

const getComplaintStatusLabel = (status: string): string => {
  switch (status) {
    case 'in_progress':
      return 'На рассмотрении';
    case 'approved':
      return 'Одобрено';
    case 'rejected':
      return 'Отклонено';
    default:
      return status;
  }
};

  const achievements = achievementsData?.achievements ?? [];
  const organizerEvents = eventsData?.as_organizer ?? [];
  const participantEvents = eventsData?.as_participant ?? [];
  const applicantEvents = eventsData?.as_applicant ?? [];

  const profileBlocks = [
    {
      id: 'achievements',
      title: 'Достижения',
      subtitle: `${achievements.length} элементов`,
      icon: Trophy,
      content: (
        <div className="space-y-4">
          {achievementsLoading ? (
            <p className="text-center py-8 text-gray-500">Загрузка достижений...</p>
          ) : achievements.length > 0 ? (
            achievements.map((ach: any) => (
              <AchievementCard key={ach.id} achievement={ach} />
            ))
          ) : (
            <p className="text-center py-12 text-gray-500">Пока нет достижений</p>
          )}
        </div>
      ),
    },
    {
      id: 'events',
      title: 'События',
      subtitle: `${organizerEvents.length + participantEvents.length + applicantEvents.length} элементов`,
      icon: Calendar,
      content: (
        <div className="space-y-8">
          {eventsLoading ? (
            <p className="text-center py-8 text-gray-500">Загрузка событий...</p>
          ) : (
            <>
              {organizerEvents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-emerald-700 mb-4 text-base flex items-center gap-2">
                    Я организатор <ArrowRight size={16} />
                  </h4>
                  <div className="space-y-4">
                    {organizerEvents.map((event: any) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        currentUserRole={profile.role}
                        onRefresh={refetchEvents || (() => window.location.reload())}
                        onOpenEdit={handleOpenEditEvent}
                      />
                    ))}
                  </div>
                </div>
              )}

              {participantEvents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-emerald-700 mb-4 text-base flex items-center gap-2">
                    Я участник <ArrowRight size={16} />
                  </h4>
                  <div className="space-y-4">
                    {participantEvents.map((event: any) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        currentUserRole={profile.role}
                        onRefresh={refetchEvents || (() => window.location.reload())}
                        onOpenEdit={handleOpenEditEvent}
                      />
                    ))}
                  </div>
                </div>
              )}

              {applicantEvents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-emerald-700 mb-4 text-base flex items-center gap-2">
                    Мои заявки <ArrowRight size={16} />
                  </h4>
                  <div className="space-y-4">
                    {applicantEvents.map((event: any) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        currentUserRole={profile.role}
                        onRefresh={refetchEvents || (() => window.location.reload())}
                        onOpenEdit={handleOpenEditEvent}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!organizerEvents.length && !participantEvents.length && !applicantEvents.length && (
                <p className="text-center py-12 text-gray-500">Пока нет событий</p>
              )}
            </>
          )}
        </div>
      ),
    },
    {
  id: 'moderations',
  title: 'Заявки на модерацию',
  iconColor: 'bg-emerald-100 text-emerald-600',
  icon: Stamp,
  content: (
    <div className="space-y-4">
      {moderationsLoading ? (
        <p className="text-center py-8 text-gray-500">Загрузка заявок...</p>
      ) : moderationsData && moderationsData.length > 0 ? (
        moderationsData.map((item: ModerationRecordRead) => (
          <div 
            key={item.id} 
            className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-lg">Заявка #{item.id}</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {getActionLabel(item.action_type)}
                </p>
              </div>

              <div className={`px-3.5 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                item.status === 'approved' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : item.status === 'rejected' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {getStatusLabel(item.status)}
              </div>
            </div>

            {item.moderator_comment && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 italic">
                  «{item.moderator_comment}»
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
              {new Date(item.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center py-12 text-gray-500">
          Пока нет заявок на модерацию
        </p>
      )}
    </div>
  ),
},
    {
  id: 'complaints',
  title: 'Жалобы',
  subtitle: `${complaintsData?.complaints?.length ?? 0} обращений`,
  icon: Pen,
  iconColor: 'bg-emerald-100 text-emerald-600',
  content: (
    <div className="space-y-4">
      {complaintsLoading ? (
        <p className="text-center py-8 text-gray-500">Загрузка...</p>
      ) : complaintsData?.complaints && complaintsData.complaints.length > 0 ? (
        complaintsData.complaints.map((complaint: ComplaintRead) => (
          <div key={complaint.id} className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-base">Жалоба #{complaint.id}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {getTargetLabel(complaint.target_type, complaint.target_name)}
                </p>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                complaint.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                complaint.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {getComplaintStatusLabel(complaint.status)}
              </div>
            </div>

            {complaint.comment && (
              <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                {complaint.comment}
              </p>
            )}
          </div>
        ))
      ) : (
        <p className="text-center py-12 text-gray-500">Пока нет жалоб</p>
      )}

      <button
        onClick={() => handleOpenComplaint('content', 1, 'Общий контент')}
        className="w-full mt-4 py-3.5 border border-dashed border-emerald-300 rounded-2xl text-emerald-600 hover:bg-emerald-50 font-medium transition-colors"
      >
        + Подать новую жалобу
      </button>
    </div>
  ),
},
    {
      id: 'account',
      title: 'Аккаунт',
      subtitle: 'Профиль и настройки',
      icon: UserCog,
      content: (
        <AccountContent
          profile={profile}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-emerald-50 pb-24">
      <ProfileGreenHeader
        fullName={profile?.name || ''}
        role={profile?.role || 'citizen'}
        points={profile?.experience_points}
        eventsCount={(organizerEvents.length + participantEvents.length + applicantEvents.length)}
      />

      <div className="px-4 -mt-4 relative z-10 space-y-4">
        {profileBlocks.map((block) => {
          const isExpanded = expandedBlock === block.id;
          const Icon = block.icon;

          return (
            <div
              key={block.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-emerald-100 active:scale-[0.99] transition-all"
            >
              <button
                type="button"
                onClick={() => toggleBlock(block.id)}
                className="w-full p-4 flex items-center justify-between gap-4 text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#ceede1] flex items-center justify-center text-emerald-700 shrink-0">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base text-gray-900 leading-tight">
                        {block.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{block.subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  <ArrowRight size={18} className="text-gray-400" />
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-5 border-t border-gray-100 pt-4">
                  {block.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <EventFormModal
        isOpen={isEventModalOpen}
        mode="edit"
        initialEvent={editingEvent}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSuccess={handleEventSuccess}
      />
      <ComplaintFormModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSuccess={handleComplaintSuccess}
      />
    </div>
  );
};

export default ProfileBlock;