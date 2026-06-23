import { useState } from 'react';
import { userApi } from '../../../entities/profile/api';
import type { UserUpdate, UserPublicRead } from '../../../entities/profile/types';

interface EditProfileFormProps {
  profile: UserPublicRead;
  onSuccess?: (updatedUser: UserPublicRead) => void;
  onCancel?: () => void;
}

export const EditProfileForm = ({ profile, onSuccess, onCancel }: EditProfileFormProps) => {
  const [formData, setFormData] = useState<UserUpdate>({
    name: profile.name,
    email: profile.email,
    description: profile.description || '',
    inn: profile.inn,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await userApi.updateProfile(formData);
      onSuccess?.(updatedUser);
      alert('Профиль успешно обновлён!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка обновления');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Данные профиля */}
        <div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Имя</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {(profile.role === 'organization' || formData.description?.trim()) && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Описание</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-y"
                  placeholder="Расскажите о себе или организации..."
                />
              </div>
            )}

            {profile.role === 'organization' && (
              <div>
                <label className="text-sm text-gray-500 mb-1 block">ИНН</label>
                <input
                  type="text"
                  value={formData.inn || ''}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-blue-500"
                  placeholder="123456789012"
                />
              </div>
            )}
          </div>
        </div>

        {/* Контактные данные */}
        <div>
          <h4 className="text-lg font-medium mb-4">Контактные данные</h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm pt-2">{error}</p>}

        {/* Кнопки */}
        <div className="flex gap-3 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Сохраняем...' : 'Сохранить изменения'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};