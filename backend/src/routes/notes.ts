import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { authenticateToken } from '../middleware/auth';
import { bulkDeleteNotes } from '../controllers/notesController';
const router = express.Router();
// Bulk delete notes
router.post('/bulk-delete', authenticateToken, bulkDeleteNotes);
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

router.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY favorite DESC, updated_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;
    
    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { title, content, tags = [] } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO notes (user_id, title, content, tags) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, content, JSON.stringify(tags)]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;
    const { title, content, tags = [] } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const result = await pool.query(
      'UPDATE notes SET title = $1, content = $2, tags = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, content, JSON.stringify(tags), noteId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle favorite status
router.patch('/:id/favorite', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;

    const result = await pool.query(
      'UPDATE notes SET favorite = NOT favorite, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [noteId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;
    
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
      [noteId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
