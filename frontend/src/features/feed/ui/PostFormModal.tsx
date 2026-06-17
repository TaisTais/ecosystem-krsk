import { useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronDown, Check, ImagePlus } from 'lucide-react';
import axios from 'axios';

import { feedApi } from '../../../entities/feed/api';
import type { PostRead, PostType } from '../../../entities/feed/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  initialPost?: PostRead | null;
};

type FormState = {
  title: string;
  content: string;
  tags: string;
  event_id: string;
  post_type: PostType;
  is_published: boolean;
  image_file: File | null;
};

const makeEmptyState = (): FormState => ({
  title: '',
  content: '',
  tags: '',
  event_id: '',
  post_type: 'post',
  is_published: true,
  image_file: null,
});

const makeEditState = (post: PostRead): FormState => ({
  title: post.title || '',
  content: post.content || '',
  tags: post.tags?.join(', ') || '',
  event_id: post.event_id ? String(post.event_id) : '',
  post_type: post.post_type,
  is_published: post.is_published,
  image_file: null,
});

type PostTypeSelectProps = {
  value: PostType;
  onChange: (value: PostType) => void;
};

const typeItems: { label: string; value: PostType }[] = [
  { label: 'Пост', value: 'post' },
  { label: 'Статья', value: 'article' },
  { label: 'Эко-вызов', value: 'challenge' },
  { label: 'Мероприятие', value: 'event_invite' },
];

const PostTypeSelect = ({ value, onChange }: PostTypeSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const currentLabel = useMemo(
    () => typeItems.find((item) => item.value === value)?.label ?? 'Пост',
    [value]
  );

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 w-full rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50">
            {typeItems.map((item) => (
              <button
                key={item.value}
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
        </>
      )}
    </div>
  );
};

const PostFormModal = ({ isOpen, onClose, onSuccess, mode, initialPost }: Props) => {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState<FormState>(() => {
    if (isEdit && initialPost) return makeEditState(initialPost);
    return makeEmptyState();
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needEventId = form.post_type === 'challenge' || form.post_type === 'event_invite';

  if (!isOpen) return null;

  const uploadImage = async () => {
    if (!form.image_file) return isEdit && initialPost?.image_url ? initialPost.image_url : null;

    const fd = new FormData();
    fd.append('file', form.image_file);

    const res = await axios.post('/service/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return (res.data?.url as string | undefined) ?? null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const imageUrl = await uploadImage();

      if (isEdit && initialPost) {
        await feedApi.updatePost(initialPost.id, {
          title: form.title.trim() || null,
          content: form.content.trim(),
          image_url: imageUrl,
          tags,
          is_published: form.is_published,
        });
      } else {
        await feedApi.createPost({
          title: form.title.trim() || null,
          content: form.content.trim(),
          image_url: imageUrl,
          tags,
          event_id: needEventId ? Number(form.event_id) : null,
          post_type: form.post_type,
          is_published: form.is_published,
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      let message = 'Не удалось сохранить пост.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { detail?: string; message?: string };
        message = data?.detail || data?.message || message;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-visible flex flex-col">
        <div className="p-4 sm:p-5 border-b flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg sm:text-xl">
              {isEdit ? 'Редактировать пост' : 'Создать пост'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? 'Измените поля и сохраните' : 'Заполните поля нового поста'}
            </p>
          </div>

          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 sm:p-5 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-2">Тип поста</label>
              <PostTypeSelect
                value={form.post_type}
                onChange={(value) => setForm((prev) => ({ ...prev, post_type: value }))}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Заголовок</label>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Заголовок поста"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Текст</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 min-h-40"
              placeholder="Текст поста"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Фото поста</label>
            <label className="w-full flex items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 cursor-pointer hover:bg-gray-100">
              <span className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                <ImagePlus size={18} className="text-emerald-600 shrink-0" />
                <span className="truncate">
                  {form.image_file ? form.image_file.name : 'Выбрать фото'}
                </span>
              </span>
              <span className="text-xs text-gray-400 shrink-0">JPG, PNG, WEBP</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((prev) => ({ ...prev, image_file: e.target.files?.[0] ?? null }))}
                className="hidden"
              />
            </label>

            {form.image_file && (
              <img
                src={URL.createObjectURL(form.image_file)}
                alt=""
                className="mt-3 w-full max-h-64 object-cover rounded-3xl"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Теги</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="раздельно, через, запятую"
            />
          </div>

          {needEventId && (
            <div>
              <label className="block text-sm font-medium mb-2">Event ID</label>
              <input
                value={form.event_id}
                onChange={(e) => setForm((prev) => ({ ...prev, event_id: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="123"
                inputMode="numeric"
              />
            </div>
          )}

          <label className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))}
            />
            <span className="text-sm font-medium">Опубликовать сразу</span>
          </label>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 text-red-600 p-4 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-medium disabled:bg-gray-400"
          >
            {submitting ? 'Сохраняем...' : isEdit ? 'Сохранить изменения' : 'Создать пост'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostFormModal;