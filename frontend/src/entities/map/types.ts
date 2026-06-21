// src/entities/ecopoint/types.ts

export type SourceType = "local" | "recyclemap";
export type EcoPointStatus = "working" | "closed" | "temporarily_closed";

export type EcoPointCategory =
  | "PLASTIC"
  | "PAPER"
  | "GLASS"
  | "METAL"
  | "BATTERIES"
  | "CLOTHES"
  | "ELECTRONICS"
  | "HAZARDOUS"
  | "OTHER"
  | "OWN_TARA";


export type EcoPointReview = {
  id: number;
  user_id: number;
  user_name?: string | null;
  comment: string | null;
  photo_url: string | null;
  created_at: string;
};

export type PointStatus = {
  id: number;
  ecopoint_id: number;
  user_id: number;
  status: EcoPointStatus;
  created_at: string;
};

export type EcoPointList = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  types: EcoPointCategory[];
  working_hours?: string | null;
};

export type EcoPoint = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  types: EcoPointCategory[];
  source: SourceType;

  description?: string | null;
  working_hours?: string | null;
  contacts?: Record<string, string> | null;   // ← исправлено

  created_at: string;
  last_local_update_at?: string | null;
  recyclemap_updated_at?: string | null;
  created_by_id?: number | null;
  needs_review: boolean;

  most_confirmed_status?: {
    status: EcoPointStatus;
    confirmed_by: number;
  } | null;
  reviews_count: number;
};

export type EcoPointDetail = EcoPoint & {
  reviews: EcoPointReview[];
  statuses_summary: Array<{ status: EcoPointStatus; confirmed_by: number }>;
};

export type EcoPointCreate = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  types: EcoPointCategory[];
  description?: string | null;
  working_hours?: string | null;
  contacts?: Record<string, string> | null;
};

export type EcoPointUpdate = Partial<EcoPointCreate>;