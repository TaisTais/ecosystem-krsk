import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

type Props = {
  canEdit: boolean;
  canTogglePublication: boolean;
  isPublished: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublication: () => void;
};

const PostActionsMenu = ({
  canEdit,
  canTogglePublication,
  isPublished,
  onEdit,
  onDelete,
  onTogglePublication,
}: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!canEdit && !canTogglePublication) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden z-20">
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50"
            >
              <Pencil size={16} />
              Редактировать
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50 text-red-600"
          >
            <Trash2 size={16} />
            Удалить
          </button>

          {canTogglePublication && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onTogglePublication();
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50"
            >
              {isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
              {isPublished ? 'Скрыть' : 'Опубликовать'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostActionsMenu;