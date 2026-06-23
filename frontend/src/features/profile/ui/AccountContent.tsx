import { useState } from 'react';
import { EditProfileForm } from './EditProfileForm';
import type { UserPublicRead } from '../../../entities/profile/types';

interface AccountContentProps {
  profile: UserPublicRead;
}

export const AccountContent = ({ profile }: AccountContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<UserPublicRead>(profile);

  const handleEditSuccess = (updatedUser: UserPublicRead) => {
    setCurrentProfile(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => setIsEditing(false);

  return (
    <div className="space-y-6">
      {isEditing ? (
        <EditProfileForm
          profile={currentProfile}
          onSuccess={handleEditSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <div className="space-y-8">
          
          {/* Данные профиля */}
          <div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Имя</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900">
                  {currentProfile.name}
                </div>
              </div>

              {currentProfile.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Описание</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 whitespace-pre-wrap">
                    {currentProfile.description}
                  </div>
                </div>
              )}

              {currentProfile.role === 'organization' && currentProfile.inn && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">ИНН</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono">
                    {currentProfile.inn}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Контактные данные */}
          <div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  {currentProfile.email}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t text-sm text-gray-500">
            Дата регистрации: {new Date(currentProfile.created_at).toLocaleDateString('ru-RU')}
          </div>
        </div>
      )}
      {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white w-full py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Редактировать
          </button>
        )}
    </div>
  );
};