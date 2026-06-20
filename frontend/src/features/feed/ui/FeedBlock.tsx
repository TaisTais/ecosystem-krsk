import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Plus, ChevronDown, Check } from 'lucide-react';
import axios from 'axios';

import { feedApi } from '../../../entities/feed/api';
import type { PostRead, PostType, PostWithComments } from '../../../entities/feed/types';
import { useAuth } from '../../../app/context/AuthContext';
import PostCard from './PostCard';
import PostWithCommentsModal from './PostWithCommentsModal';
import PostFormModal from './PostFormModal';

type FilterState = {
  post_type: PostType | '';
  tag: string;
  author_id: string;
};

type PostTypeFilterMenuProps = {
  value: PostType | '';
  onChange: (value: PostType | '') => void;
};

const postTypeItems: { label: string; value: PostType | '' }[] = [
  { label: 'Все типы', value: '' },
  { label: 'Пост', value: 'post' },
  { label: 'Статья', value: 'article' },
  { label: 'Эко-вызов', value: 'challenge' },
  { label: 'Мероприятие', value: 'event_invite' },
];

const PostTypeFilterMenu = ({ value, onChange }: PostTypeFilterMenuProps) => {
  const [open, setOpen] = useState(false);

  const currentLabel = postTypeItems.find((item) => item.value === value)?.label ?? 'Все типы';

  return (
    <div className="relative">
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
          <div className="absolute left-0 mt-2 w-full min-w-56 rounded-2xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50">
            {postTypeItems.map((item) => (
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
        </>
      )}
    </div>
  );
};

const FeedBlock = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<PostRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    post_type: '',
    tag: '',
    author_id: '',
  });

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedPostComments, setSelectedPostComments] = useState<PostWithComments | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editPost, setEditPost] = useState<PostRead | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await feedApi.getFeed({
        post_type: filters.post_type || null,
        tag: filters.tag || null,
        author_id: filters.author_id ? Number(filters.author_id) : null,
        skip: 0,
        limit: 50,
      });
      setPosts(data);
    } catch (err: unknown) {
      let message = 'Не удалось загрузить ленту.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { detail?: string; message?: string };
        message = data?.detail || data?.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters.post_type, filters.tag, filters.author_id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFeed();
  }, [loadFeed]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      return (
        p.author_name.toLowerCase().includes(q) ||
        (p.title || '').toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, search]);

  const openComments = async (postId: number) => {
    setSelectedPostId(postId);
    setCommentsOpen(true);
    const data = await feedApi.getPostWithComments(postId);
    setSelectedPostComments(data);
  };

  const closeComments = () => {
    setCommentsOpen(false);
    setSelectedPostId(null);
    setSelectedPostComments(null);
  };

  const refreshAll = async () => {
    await loadFeed();
    if (commentsOpen && selectedPostId) {
      const data = await feedApi.getPostWithComments(selectedPostId);
      setSelectedPostComments(data);
    }
  };

  const openEdit = async (postId: number) => {
    const full = await feedApi.getPost(postId);
    setEditPost({
      ...full,
      comments_count: full.comments_count,
      likes_count: full.likes_count,
      is_deleted: full.is_deleted,
    });
    setEditOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <div className="px-4 py-3 sticky top-0 z-50 bg-white border-b">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Поиск по ленте..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-base rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={22} />
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="p-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex flex-row  gap-2 mt-3">
          <PostTypeFilterMenu
            value={filters.post_type}
            onChange={(value) => setFilters((prev) => ({ ...prev, post_type: value }))}
          />

          <input
            value={filters.tag}
            onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
            placeholder="Тег"
            className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm bg-white"
          />

          <input
            value={filters.author_id}
            onChange={(e) => setFilters((prev) => ({ ...prev, author_id: e.target.value }))}
            placeholder="Автор ID"
            className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {error && <div className="rounded-2xl bg-red-50 border border-red-200 text-red-600 p-4">{error}</div>}

        {!loading &&
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id ?? null}
              currentUserRole={user?.role ?? null}
              onOpenComments={openComments}
              onOpenEdit={openEdit}
              onRefresh={refreshAll}
            />
          ))}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center text-gray-500 py-12">Ничего не найдено</div>
        )}
      </div>

      <PostWithCommentsModal
        isOpen={commentsOpen}
        onClose={closeComments}
        post={selectedPostComments}
        onUpdated={refreshAll}
      />

      <PostFormModal
        key={createOpen ? 'create' : 'create-closed'}
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={refreshAll}
        mode="create"
      />

      <PostFormModal
        key={editPost?.id ?? 'edit-empty'}
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditPost(null);
        }}
        onSuccess={refreshAll}
        mode="edit"
        initialPost={editPost}
      />
    </div>
  );
};

export default FeedBlock;