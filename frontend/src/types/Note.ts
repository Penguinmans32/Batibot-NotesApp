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
  created_at: string;
  updated_at: string;
}
