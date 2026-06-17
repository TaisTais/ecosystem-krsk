import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { PostType } from '../../../entities/feed/types';

type Props = {
  value: PostType | '';
  onChange: (value: PostType | '') => void;
};

const items: { label: string; value: PostType | '' }[] = [
  { label: 'Все типы', value: '' },
  { label: 'Пост', value: 'post' },
  { label: 'Статья', value: 'article' },
  { label: 'Эко-вызов', value: 'challenge' },
  { label: 'Мероприятие', value: 'event_invite' },
];

const PostTypeFilterMenu = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const currentLabel = items.find((item) => item.value === value)?.label ?? 'Все типы';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm hover:bg-gray-50"
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDown size={16} className="text-gray-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-full min-w-56 rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden z-20">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onChange(item.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-gray-50"
            >
              <span>{item.label}</span>
              {item.value === value && <Check size={16} className="text-emerald-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostTypeFilterMenu;