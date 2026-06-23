import type { EventRead } from "../events/types";

export type UserRole = 'citizen' | 'organization' | 'moderator' | 'admin';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type ActionType = 
  | 'add_point'
  | 'update_point'
  | 'participate_event'
  | 'organize_event'
  | 'set_status'
  | 'write_review';

export type ModerationRecordRead = {
  id: number;
  action_type: ActionType;
  action_id: number;
  status: ModerationStatus;
  created_at: string;
  moderated_at?: string | null;
  moderator_comment?: string | null;
  user_name?: string | null;
};

export type UserPublicRead = {
  id: number;
  name: string;
  full_name?: string;
  email: string;
  role: UserRole;
  experience_points?: number;
  description?: string;
  inn?: string;
  created_at: string;
  is_blocked: boolean;
};

export type UserRead = UserPublicRead & {
  // дополнительные поля при необходимости
};

// Achievement types
export type Achievement = {
  id: number;
  name: string;
  description: string;
  icon?: string;
  badge_icon?: string;
  points_reward: number;
  is_cumulative: boolean;
  action_type: string;
  required_count?: number;
  is_active: boolean;
  created_at: string;
};

export type UserAchievementRead = {
  id: number;
  achievement_id: number;
  name: string;
  description: string;
  icon?: string;
  badge_icon?: string;
  points_reward: number;
  achieved_at: string;
  is_cumulative: boolean;
};

export type UserAchievementList = {
  achievements: UserAchievementRead[];
};

export type MyEventsRead = {
  events: EventRead[];
  as_organizer?: EventRead[];
  as_participant?: EventRead[];
  as_applicant?: EventRead[];
};

// Добавь этот тип
export type UserUpdate = {
  name?: string;
  email?: string;
  description?: string;
  inn?: string;
};
