export interface User {
  id: number;
  email: string;
  password?: string;
  google_id?: string;
  name: string;
  avatar_url?: string;
  created_at: Date;
}