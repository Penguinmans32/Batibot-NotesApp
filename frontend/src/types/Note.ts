export interface NoteTag {
  name: string;
  color: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  tags?: NoteTag[];
  favorite?: boolean;
  status?: 'pending' | 'confirmed';
  address?: string;
  tx_hash?: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}
