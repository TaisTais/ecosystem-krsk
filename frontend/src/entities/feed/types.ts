export type PostType = 'post' | 'article' | 'challenge' | 'event_invite';

export type UserRole = 'resident' | 'organization' | 'moderator' | 'admin' | string;

export type PostFilter = {
  post_type?: PostType | null;
  tag?: string | null;
  author_id?: number | null;
  skip?: number;
  limit?: number;
  is_published?: boolean | null;
};

export type PostRead = {
  id: number;
  author_id: number;
  author_name: string;
  author_role: UserRole;
  post_type: PostType;
  title: string | null;
  content: string;
  image_url: string | null;
  tags: string[];
  event_id: number | null;
  created_at: string;
  is_published: boolean;
  is_deleted: boolean;
  likes_count: number;
  comments_count: number;
};

export type PostDetailRead = PostRead & {
  deleted_at?: string | null;
  deleted_reason?: string | null;
};

export type CommentRead = {
  id: number;
  post_id: number;
  commentator_id: number;
  commentator_name: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_reason?: string | null;
};

export type PostWithComments = PostRead & {
  comments: CommentRead[];
};

export type PostUpdate = {
  title?: string | null;
  content?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  is_published?: boolean | null;
};

export type CommentCreate = {
  content: string;
};

export type LikeToggleResponse = {
  post_id: number;
  user_id: number;
  is_liked: boolean;
  likes_count: number;
};

export type PostCreateResponse = {
  id: number;
  author_id: number;
  author_name: string;
  author_role: UserRole;
  post_type: PostType;
  title: string | null;
  content: string;
  image_url: string | null;
  tags: string[] | null;
  event_id: number | null;
  created_at: string;
  is_published: boolean;
};