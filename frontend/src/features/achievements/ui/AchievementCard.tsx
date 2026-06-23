import type { UserAchievementRead } from '../../../entities/profile/types';

type Props = {
  achievement: UserAchievementRead;
};

const AchievementCard = ({ achievement }: Props) => {
  return (
    <div className="bg-white py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex gap-4">
        <div className="flex flex-col items-center w-14 shrink-0">
          <img
  src={`/images/${achievement.icon}`}
  alt={achievement.name}
  width={40}
  height={40}
  className="w-12 h-12 object-contain"
  onError={(e) => {
    console.error(`Ошибка загрузки иконки: ${achievement.icon}`);
    e.currentTarget.style.display = 'none';
  }}
/>
          <div className="mt-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            +{achievement.points_reward}
          </div>
        </div>

        {/* Правая часть - информация */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-base leading-tight text-gray-900">
            {achievement.name}
          </h4>

          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
            {achievement.description}
          </p>

          {achievement.achieved_at && (
            <p className="text-xs text-gray-500 mt-3">
              Получено: {new Date(achievement.achieved_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;