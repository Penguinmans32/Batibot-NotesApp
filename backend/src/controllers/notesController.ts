import { Request, Response } from 'express';
import { pool } from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 AND deleted_at IS NULL ORDER BY updated_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content, tags) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, content, JSON.stringify(tags)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, tags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Check if note belongs to user and is not deleted
    const noteCheck = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, req.user.id]
    );

    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, tags = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, content, JSON.stringify(tags), id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if note belongs to user and is not already deleted
    const noteCheck = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, req.user.id]
    );

    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Soft delete - set deleted_at timestamp
    const result = await pool.query(
      'UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    res.json({ message: 'Note moved to recycle bin', note: result.rows[0] });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkDeleteNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No note IDs provided' });
    }

    // Soft delete notes belonging to the user
    const result = await pool.query(
      `UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ANY($1) AND user_id = $2 AND deleted_at IS NULL RETURNING id`,
      [ids, req.user.id]
    );

    res.json({ message: 'Notes moved to recycle bin', deletedIds: result.rows.map(r => r.id) });
  } catch (error) {
    console.error('Error bulk deleting notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Recycle Bin Functions
export const getDeletedNotes = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 AND deleted_at IS NOT NULL ORDER BY deleted_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching deleted notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const restoreNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if note belongs to user and is deleted
    const noteCheck = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
      [id, req.user.id]
    );

    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Deleted note not found' });
    }

    // Restore note by setting deleted_at to null
    const result = await pool.query(
      'UPDATE notes SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    res.json({ message: 'Note restored successfully', note: result.rows[0] });
  } catch (error) {
    console.error('Error restoring note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const permanentlyDeleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if note belongs to user and is deleted
    const noteCheck = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
      [id, req.user.id]
    );

    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Deleted note not found' });
    }

    // Permanently delete the note
    await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({ message: 'Note permanently deleted' });
  } catch (error) {
    console.error('Error permanently deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkRestoreNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No note IDs provided' });
    }

    // Restore notes belonging to the user
    const result = await pool.query(
      `UPDATE notes SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1) AND user_id = $2 AND deleted_at IS NOT NULL RETURNING id`,
      [ids, req.user.id]
    );

    res.json({ message: 'Notes restored successfully', restoredIds: result.rows.map(r => r.id) });
  } catch (error) {
    console.error('Error bulk restoring notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkPermanentlyDeleteNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No note IDs provided' });
    }

    // Permanently delete notes belonging to the user
    const result = await pool.query(
      `DELETE FROM notes WHERE id = ANY($1) AND user_id = $2 AND deleted_at IS NOT NULL RETURNING id`,
      [ids, req.user.id]
    );

    res.json({ message: 'Notes permanently deleted', deletedIds: result.rows.map(r => r.id) });
  } catch (error) {
    console.error('Error bulk permanently deleting notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cleanup function to automatically delete notes older than 30 days
export const cleanupExpiredNotes = async () => {
  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL \'30 days\' RETURNING id'
    );
    
    console.log(`Cleaned up ${result.rows.length} expired notes`);
    return result.rows.length;
  } catch (error) {
    console.error('Error cleaning up expired notes:', error);
    return 0;
  }
};

export const toggleNoteFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if note belongs to user and is not deleted
    const noteCheck = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, req.user.id]
    );

    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const currentNote = noteCheck.rows[0];
    const newFavoriteStatus = !currentNote.favorite;

    const result = await pool.query(
      'UPDATE notes SET favorite = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [newFavoriteStatus, id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling note favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
};