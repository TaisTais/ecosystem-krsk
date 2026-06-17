import api from '../../shared/lib/api';
import type {
  CommentCreate,
  CommentRead,
  LikeToggleResponse,
  PostCreateResponse,
  PostDetailRead,
  PostFilter,
  PostRead,
  PostType,
  PostUpdate,
  PostWithComments,
} from './types';

const buildQuery = (filters?: PostFilter) => {
  const params = new URLSearchParams();
  if (!filters) return '';
  if (filters.post_type) params.set('post_type', filters.post_type);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.author_id !== undefined && filters.author_id !== null) params.set('author_id', String(filters.author_id));
  if (filters.skip !== undefined) params.set('skip', String(filters.skip));
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.is_published !== undefined && filters.is_published !== null) {
    params.set('is_published', String(filters.is_published));
  }
  const q = params.toString();
  return q ? `?${q}` : '';
};

export const feedApi = {
  getFeed: async (filters?: PostFilter): Promise<PostRead[]> => {
    const response = await api.get(`/feed/${buildQuery(filters)}`);
    return response.data;
  },

  getMyPosts: async (filters?: Omit<PostFilter, 'author_id'>): Promise<PostRead[]> => {
    const params = new URLSearchParams();
    if (filters?.post_type) params.set('post_type', filters.post_type);
    if (filters?.tag) params.set('tag', filters.tag);
    if (filters?.skip !== undefined) params.set('skip', String(filters.skip));
    if (filters?.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters?.is_published !== undefined && filters?.is_published !== null) {
      params.set('is_published', String(filters.is_published));
    }
    const q = params.toString();
    const response = await api.get(`/feed/my${q ? `?${q}` : ''}`);
    return response.data;
  },

  getPost: async (postId: number): Promise<PostDetailRead> => {
    const response = await api.get(`/feed/${postId}`);
    return response.data;
  },

  getPostWithComments: async (postId: number): Promise<PostWithComments> => {
    const response = await api.get(`/feed/${postId}/full`);
    return response.data;
  },

  updatePost: async (postId: number, data: PostUpdate): Promise<PostRead> => {
    const response = await api.patch(`/feed/${postId}/edit`, data);
    return response.data;
  },

  togglePublication: async (postId: number, isPublished: boolean): Promise<PostRead> => {
    const response = await api.patch(`/feed/${postId}/publication`, null, {
      params: { is_published: isPublished },
    });
    return response.data;
  },

  deletePost: async (postId: number): Promise<{ message: string; post_id: number }> => {
    const response = await api.delete(`/feed/${postId}`);
    return response.data;
  },

  toggleLike: async (postId: number): Promise<LikeToggleResponse> => {
    const response = await api.post(`/feed/${postId}/like`);
    return response.data;
  },

  addComment: async (postId: number, data: CommentCreate): Promise<CommentRead> => {
    const response = await api.post(`/feed/${postId}/comments`, data);
    return response.data;
  },

  deleteComment: async (postId: number, commentId: number): Promise<{ message: string; comment_id: number }> => {
    const response = await api.delete(`/feed/${postId}/comments/${commentId}`);
    return response.data;
  },

  createPost: async (data: {
    title?: string | null;
    content: string;
    image_url?: string | null;
    tags?: string[] | null;
    event_id?: number | null;
    post_type: PostType;
    is_published?: boolean;
  }): Promise<PostCreateResponse> => {
    const response = await api.post('/feed/', data);
    return response.data;
  },
};