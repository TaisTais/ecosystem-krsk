import { useMemo, useState } from 'react';
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

import type { PostRead, UserRole } from '../../../entities/feed/types';
import { feedApi } from '../../../entities/feed/api';
import PostActionsMenu from './PostActionsMenu';

type Props = {
  post: PostRead;
  currentUserId?: number | null;
  currentUserRole?: string | null;
  onOpenComments: (postId: number) => void;
  onOpenEdit: (postId: number) => void;
  onRefresh: () => void;
};

const roleLabels: Record<UserRole, string> = {
  citizen: 'Житель',
  moderator: 'Модератор',
  organization: 'Организация',
  admin: 'Администратор',
};

const PREVIEW_LIMIT = 180;

const labelByType = (type: PostRead['post_type']) => {
  if (type === 'challenge') return 'Эко-вызов';
  if (type === 'event_invite') return 'Мероприятие';
  if (type === 'article') return 'Статья';
  return null;
};

const PostCard = ({
  post,
  currentUserId,
  currentUserRole,
  onOpenComments,
  onOpenEdit,
  onRefresh,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [liking, setLiking] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [imageHidden, setImageHidden] = useState(false);

  const canEdit = currentUserId === post.author_id;
  const canTogglePublication = canEdit || currentUserRole === 'moderator';

  const hasMore = post.content.length > PREVIEW_LIMIT;

  const preview = useMemo(() => {
    if (!hasMore) return post.content;
    return `${post.content.slice(0, PREVIEW_LIMIT)}...`;
  }, [hasMore, post.content]);

  const visibleContent = expanded ? post.content : preview;

  const handleLike = async () => {
    setLiking(true);
    try {
      const res = await feedApi.toggleLike(post.id);
      setLikesCount(res.likes_count);
      onRefresh();
    } finally {
      setLiking(false);
    }
  };

  const handleTogglePublication = async () => {
    try {
      await feedApi.togglePublication(post.id, !post.is_published);
      onRefresh();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      }
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Удалить этот пост?');
    if (!confirmed) return;

    try {
      await feedApi.deletePost(post.id);
      onRefresh();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data);
      }
    }
  };

  return (
    <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base sm:text-lg">{post.author_name}</h3>
              <span className="text-xs text-gray-500">· {roleLabels[post.author_role]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {labelByType(post.post_type) && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                {labelByType(post.post_type)}
              </span>
            )}

            <PostActionsMenu
              canEdit={canEdit}
              canTogglePublication={canTogglePublication}
              isPublished={post.is_published}
              onEdit={() => onOpenEdit(post.id)}
              onDelete={handleDelete}
              onTogglePublication={handleTogglePublication}
            />
          </div>
        </div>

        {post.image_url?.trim() && !imageHidden && (
          <img
            src={post.image_url}
            alt=""
            className="w-full rounded-3xl object-cover max-h-96 bg-gray-100"
            onError={() => setImageHidden(true)}
          />
        )}

        <div className="mt-4 space-y-3">
          {post.title && <h4 className="text-lg font-semibold leading-tight">{post.title}</h4>}

          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{visibleContent}</p>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600"
            >
              {expanded ? (
                <>
                  Свернуть <ChevronUp size={16} />
                </>
              ) : (
                <>
                  Читать дальше <ChevronDown size={16} />
                </>
              )}
            </button>
          )}

          {expanded && (
            <p className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleString('ru-RU')}
            </p>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleLike}
              disabled={liking}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-50 hover:bg-gray-100"
            >
              <Heart size={18} className="text-rose-500" />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenComments(post.id)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-50 hover:bg-gray-100"
            >
              <MessageCircle size={18} className="text-gray-600" />
              <span className="text-sm font-medium">{post.comments_count}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;