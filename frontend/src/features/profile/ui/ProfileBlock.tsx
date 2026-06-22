import { useState } from 'react';
import { Calendar, Pen, Stamp, Trophy, UserCog } from 'lucide-react';

import ProfileHeader from './ProfileHeader';
import EventCard from '../../events/ui/EventCard';
import AccountContent from './AccountContent';
import AchievementCard from '../../achievements/ui/AchievementCard';

import { useMyProfile } from '../hooks/useMyProfile';
import { useMyAchievements } from '../hooks/useMyAchievements';
import { useMyEvents } from '../hooks/useMyEvents';
import { useMyModerations } from '../hooks/useMyModerations';
import { useMyComplaints } from '../hooks/useMyComplaints';

const ProfileBlock = () => {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  const { data: profile, loading: profileLoading, error: profileError } = useMyProfile();
  const { data: achievementsData, loading: achievementsLoading } = useMyAchievements();
  const { data: eventsData, loading: eventsLoading } = useMyEvents();
  const { data: moderationsData, loading: moderationsLoading } = useMyModerations();
  const { data: complaintsData, loading: complaintsLoading } = useMyComplaints();

  const toggleBlock = (id: string) => {
    setExpandedBlock(expandedBlock === id ? null : id);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Загрузка профиля...
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">
        Ошибка загрузки профиля
      </div>
    );
  }

  const profileBlocks = [
    {
      id: 'achievements',
      title: 'Достижения',
      iconColor: 'bg-emerald-100 text-emerald-600',
      icon: Trophy,
      content: (
        <div className="space-y-4">
          {achievementsLoading ? (
            <p className="text-center py-8 text-gray-500">Загрузка достижений...</p>
          ) : achievementsData?.achievements && achievementsData.achievements.length > 0 ? (
            achievementsData.achievements.map((ach) => (
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
      iconColor: 'bg-emerald-100 text-emerald-600',
      icon: Calendar,
      content: (
        <div className="space-y-4">
          {eventsLoading ? (
            <p className="text-center py-8 text-gray-500">Загрузка событий...</p>
          ) : eventsData?.events && eventsData.events.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eventsData.events.map((event: any) => (
              <EventCard
                key={event.id}
                event={event}
                currentUserRole={profile.role}
                onRefresh={() => {}}
                onOpenEdit={() => {}}
              />
            ))
          ) : (
            <p className="text-center py-12 text-gray-500">Пока нет событий</p>
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
            <p className="text-center py-8 text-gray-500">Загрузка...</p>
          ) : moderationsData && moderationsData.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            moderationsData.map((item: any, index: number) => (
              <div key={item.id ?? index} className="bg-gray-50 p-5 rounded-2xl">
                Заявка #{item.id} — {item.status || 'В обработке'}
              </div>
            ))
          ) : (
            <p className="text-center py-12 text-gray-500">Пока нет заявок на модерацию</p>
          )}
        </div>
      ),
    },
    {
      id: 'complaints',
      title: 'Жалобы',
      iconColor: 'bg-emerald-100 text-emerald-600',
      icon: Pen,
      content: (
        <div className="space-y-4">
          {complaintsLoading ? (
            <p className="text-center py-8 text-gray-500">Загрузка...</p>
          ) : complaintsData && complaintsData.length > 0 ? (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            complaintsData.map((complaint: any, index: number) => (
              <div key={complaint.id ?? index} className="bg-gray-50 p-5 rounded-2xl">
                Жалоба #{complaint.id}
              </div>
            ))
          ) : (
            <p className="text-center py-12 text-gray-500">Пока нет жалоб</p>
          )}
        </div>
      ),
    },
    {
      id: 'account',
      title: 'Данные аккаунта',
      iconColor: 'bg-emerald-100 text-emerald-600',
      icon: UserCog,
      content: <AccountContent profile={profile} />,
    },
  ];

  return (
    <div className="min-h-screen bg-emerald-50 pb-20">
      <ProfileHeader 
        fullName={profile.full_name || profile.name} 
        role={profile.role} 
      />

      <div className="px-4 pt-6 space-y-6">
        {profileBlocks.map((block) => {
          const isExpanded = expandedBlock === block.id;
          const Icon = block.icon;

          return (
            <div
              key={block.id}
              className="bg-white/90 rounded-3xl overflow-hidden shadow-sm border border-emerald-100 hover:shadow-md transition-all"
            >
              <div
                onClick={() => toggleBlock(block.id)}
                className="p-4 flex items-start gap-4 cursor-pointer"
              >
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-semibold text-lg text-emerald-600 leading-tight">
                    {block.title}
                  </h3>
                </div>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${block.iconColor}`}>
                  <Icon size={24} />
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-6 border-t border-gray-100 pt-4">
                  {block.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileBlock;