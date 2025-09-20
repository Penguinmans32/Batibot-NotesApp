import type { Note } from '../types/Note';

const API_BASE = 'http://localhost:5000';

export async function toggleNoteFavorite(noteId: number): Promise<Note> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/notes/${noteId}/favorite`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error('Failed to toggle favorite');
  }
  return res.json();
}