export type EventStatus = 'active' | 'cancelled' | 'finished' | 'full';

export type OrganizerInfo = {
  id: number;
  name: string;
};

export type EventRead = {
  id: number;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string | null;
  is_online: boolean;
  address?: string | null;
  meeting_link?: string | null;
  status: EventStatus;
  max_people?: number | null;
  tags: string[];
  created_at: string;
  is_user_applicant?: boolean;
  organizers?: OrganizerInfo[];
  invitation_post_url: string | null;
};

export type EventFilterParams = {
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
};

export type EventCreatePayload = {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  is_online: boolean;
  address?: string | null;
  meeting_link?: string | null;
  max_people?: number | null;           // ← изменено
  tags: string[];
  status?: EventStatus;
};

export type EventUpdatePayload = Partial<EventCreatePayload>;

export type MyEventsRead = {
  as_organizer: EventRead[];
  as_participant: EventRead[];
  as_applicant: EventRead[];
};