import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Get all todos for authenticated user
router.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY completed ASC, due_date ASC NULLS LAST, priority DESC, created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single todo
router.get('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const todoId = req.params.id;

    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [todoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new todo
router.post('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { title, description, priority = 'medium', due_date } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Validate priority
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Priority must be low, medium, or high' });
    }

    const result = await pool.query(
      'INSERT INTO todos (user_id, title, description, priority, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, title, description || null, priority, due_date || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update todo
router.put('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const todoId = req.params.id;
    const { title, description, priority, due_date, completed } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Validate priority if provided
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Priority must be low, medium, or high' });
    }

    const result = await pool.query(
      'UPDATE todos SET title = $1, description = $2, priority = $3, due_date = $4, completed = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *',
      [title, description || null, priority || 'medium', due_date || null, completed || false, todoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle todo completion status
router.patch('/:id/toggle', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const todoId = req.params.id;

    const result = await pool.query(
      'UPDATE todos SET completed = NOT completed, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [todoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete todo
router.delete('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const todoId = req.params.id;

    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
      [todoId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;