import { useMemo, useState } from 'react';
import { X, Send } from 'lucide-react';
import axios from 'axios';
import { feedApi } from '../../../entities/feed/api';
import type { CommentRead, PostWithComments } from '../../../entities/feed/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  post: PostWithComments | null;
  onUpdated: () => void;
};

type Tab = 'comments' | 'write';

const PostWithCommentsModal = ({ isOpen, onClose, post, onUpdated }: Props) => {
  const [tab, setTab] = useState<Tab>('comments');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<CommentRead[]>([]);
  const [error, setError] = useState<string | null>(null);

  const comments = useMemo(() => {
    if (!post) return [];
    return localComments.length ? localComments : post.comments;
  }, [post, localComments]);

  if (!isOpen || !post) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const created = await feedApi.addComment(post.id, { content: comment.trim() });
      setLocalComments((prev) => [created, ...prev]);
      setComment('');
      setTab('comments');
      onUpdated();
    } catch (err: unknown) {
      let message = 'Не удалось добавить комментарий.';
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
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-101">
        <div className="p-4 sm:p-5 border-b flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-lg sm:text-xl wrap-break-word">{post.title || 'Пост'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {post.author_name} · {post.author_role}
            </p>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={24} />
          </button>
        </div>

        <div className="px-4 sm:px-5 pt-4 border-b">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('comments')}
              className={`px-4 py-2 rounded-2xl text-sm font-medium ${
                tab === 'comments' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Все ({comments.length})
            </button>
            <button
              onClick={() => setTab('write')}
              className={`px-4 py-2 rounded-2xl text-sm font-medium ${
                tab === 'write' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Написать комментарий
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-5 space-y-5">
          <div className="space-y-4">
            {post.image_url && (
              <img src={post.image_url} alt="" className="w-full rounded-3xl object-cover max-h-96" />
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{new Date(post.created_at).toLocaleDateString('ru-RU')}</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                {post.post_type === 'challenge'
                  ? 'Эко-вызов'
                  : post.post_type === 'event_invite'
                    ? 'Мероприятие'
                    : post.post_type}
              </span>
            </div>

            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{post.content}</p>
            </div>
          </div>

          {tab === 'comments' && (
            <div className="space-y-3">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-sm">{c.commentator_name}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(c.created_at).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">Пока нет комментариев</p>
              )}
            </div>
          )}

          {tab === 'write' && (
            <form onSubmit={handleAddComment} className="space-y-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full min-h-36 rounded-2xl border border-gray-200 p-4 outline-none focus:border-emerald-500"
                placeholder="Напишите комментарий..."
              />

              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-200 text-red-600 p-4 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-600 text-white py-3 font-medium disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {submitting ? 'Отправляем...' : 'Отправить'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostWithCommentsModal;