import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

type Props = {
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

const EventActionsMenu = ({ canEdit, onEdit, onDelete }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  if (!canEdit) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50">
            <button
              type="button"
              onClick={() => {
                onEdit();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-50"
            >
              <Pencil size={16} />
              Редактировать
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />
              Удалить
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EventActionsMenu;