// src/features/profile/ui/AccountContent.tsx
import type { UserPublicRead } from '../../../entities/users/types';

type Props = {
  profile: UserPublicRead;
};

const AccountContent = ({ profile }: Props) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-50 p-5 rounded-2xl">
          <p className="text-gray-500 text-sm">Имя</p>
          <p className="font-medium">{profile.full_name || profile.name}</p>
        </div>

        <div className="bg-gray-50 p-5 rounded-2xl">
          <p className="text-gray-500 text-sm">Email</p>
          <p className="font-medium">{profile.email}</p>
        </div>

        {profile.experience_points !== undefined && (
          <div className="bg-gray-50 p-5 rounded-2xl">
            <p className="text-gray-500 text-sm">Баллы опыта</p>
            <p className="font-medium text-emerald-600">{profile.experience_points} XP</p>
          </div>
        )}
      </div>

      <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition-colors">
        Обновить данные
      </button>
    </div>
  );
};

export default AccountContent;