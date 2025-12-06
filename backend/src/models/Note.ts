export interface NoteTag {
  name: string;
  color: string;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  tags?: NoteTag[];
  favorite?: boolean;
  status?: 'pending' | 'confirmed';
  address?: string;
  tx_hash?: string;
  deleted_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}
