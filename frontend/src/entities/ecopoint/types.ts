export type EcoPoint = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  types: string[];           // ["пластик", "бумага", "батарейки", ...]
  description?: string;
  working_hours?: string;
  phone?: string;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
};

export type EcoPointCreate = Omit<EcoPoint, 'id' | 'created_at' | 'updated_at' | 'is_verified'>;