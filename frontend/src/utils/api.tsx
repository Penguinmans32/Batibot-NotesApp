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

// Recycle Bin API Functions
export async function getDeletedNotes(): Promise<Note[]> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/notes/recycle-bin`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch deleted notes');
  }
  return res.json();
}

export async function restoreNote(noteId: number): Promise<Note> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/notes/recycle-bin/${noteId}/restore`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error('Failed to restore note');
  }
  return res.json();
}

export async function permanentlyDeleteNote(noteId: number): Promise<void> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/notes/recycle-bin/${noteId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error('Failed to permanently delete note');
  }
}

export async function bulkRestoreNotes(noteIds: number[]): Promise<{ restoredIds: number[] }> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/notes/recycle-bin/bulk-restore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ids: noteIds })
  });
  if (!res.ok) {
    throw new Error('Failed to bulk restore notes');
  }
  return res.json();
}

export async function bulkPermanentlyDeleteNotes(noteIds: number[]): Promise<{ deletedIds: number[] }> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/api/notes/recycle-bin/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ids: noteIds })
  });
  if (!res.ok) {
    throw new Error('Failed to bulk permanently delete notes');
  }
  return res.json();
}