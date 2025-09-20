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
  created_at: Date;
  updated_at: Date;
}
