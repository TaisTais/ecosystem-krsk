// src/features/profile/ui/ProfileHeader.tsx
import PageHeader from '../../../shared/ui/PageHeader';
import type { UserRole } from '../../../entities/profile/types'; // подкорректируй путь

const roleLabels: Record<UserRole, string> = {
  citizen: 'Житель',
  moderator: 'Модератор',
  organization: 'Организация',
  admin: 'Администратор',
};

type Props = {
  fullName: string;
  role: UserRole;
};

const ProfileHeader = ({ fullName, role }: Props) => {
  return (
    <PageHeader
      leftSlot={
        <div className="flex items-center py-2.5">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 truncate">{fullName}</h1>
          </div>
        </div>
      }
      rightSlot={
        <div className="flex items-center py-2.5">
          <p className="text-sm text-gray-500">{roleLabels[role]} </p>
        </div>
      }
    />
  );
};

export default ProfileHeader;