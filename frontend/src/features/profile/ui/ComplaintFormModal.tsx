import { useState } from 'react';
import { X } from 'lucide-react';
import { complaintsApi } from '../../../entities/complaints/api';
import type { TargetType } from '../../../entities/complaints/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const targetTypeOptions: { value: TargetType; label: string; placeholder: string }[] = [
  { value: 'user', label: 'Пользователь', placeholder: 'Имя пользователя' },
  { value: 'event', label: 'Событие', placeholder: 'Название события' },
  { value: 'content', label: 'Публикация', placeholder: 'Название публикации' },
  { value: 'comment', label: 'Комментарий', placeholder: 'Текст комментария' },
];

const ComplaintFormModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [targetType, setTargetType] = useState<TargetType>('content');
  const [targetName, setTargetName] = useState('');     // ← основное поле
  const [targetId, setTargetId] = useState<number | ''>('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetName.trim()) {
      setError('Укажите имя/название объекта жалобы');
      return;
    }
    if (!comment.trim()) {
      setError('Напишите комментарий');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await complaintsApi.createComplaint({
        target_type: targetType,
        target_id: targetId ? Number(targetId) : 0,        // если ID не указан — отправляем 0
        target_name: targetName.trim(),
        comment: comment.trim(),
      });

      onSuccess();
      onClose();
      
      // Сброс формы
      setTargetName('');
      setTargetId('');
      setComment('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Не удалось отправить жалобу');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-[4px] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-semibold text-xl">Подать жалобу</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Выбор типа */}
          <div>
            <label className="block text-sm font-medium mb-2">На что жалуетесь?</label>
            <div className="grid grid-cols-2 gap-2">
              {targetTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTargetType(option.value)}
                  className={`p-3 rounded-2xl text-sm font-medium transition-all ${
                    targetType === option.value 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Название / Имя */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {targetTypeOptions.find(t => t.value === targetType)?.placeholder} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Например: Анна Смирнова или Субботник у Енисея"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          {/* ID (опционально) */}
          <div>
            <label className="block text-sm font-medium mb-2">ID объекта (если знаете)</label>
            <input
              type="number"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value ? Number(e.target.value) : '')}
              placeholder="123 (необязательно)"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Комментарий */}
          <div>
            <label className="block text-sm font-medium mb-2">Причина жалобы <span className="text-red-500">*</span></label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Опишите подробно, в чём проблема..."
              rows={5}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-emerald-500 outline-none resize-y min-h-[110px]"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !targetName.trim() || !comment.trim()}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-2xl font-medium transition-colors"
          >
            {submitting ? 'Отправляем...' : 'Отправить жалобу'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintFormModal;