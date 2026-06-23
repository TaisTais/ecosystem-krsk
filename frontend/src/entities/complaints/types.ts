export type TargetType = 'user' | 'content' | 'event' | 'comment';

export type ComplaintStatus = 'in_progress' | 'approved' | 'rejected';

export type ComplaintRead = {
  id: number;
  complainant_id: number;
  target_type: TargetType;
  target_id: number;
  target_name: string | null;
  comment?: string | null;
  status: ComplaintStatus;
  created_at: string;
  moderated_at?: string | null;
  moderator_response?: string | null;
};

export type ComplaintCreate = {
  target_type: TargetType;
  target_id: number;
  comment?: string;
  target_name: string | null;
};

export type ComplaintList = {
  complaints: ComplaintRead[];
  total: number;
};