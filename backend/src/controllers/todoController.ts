import { Request, Response } from 'express';
import { pool } from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

export const getTodos = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY completed ASC, due_date ASC NULLS LAST, priority DESC, created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, priority = 'medium', due_date } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO todos (user_id, title, description, priority, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, title, description, priority, due_date || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, priority, due_date, completed } = req.body;

    // Check if todo belongs to user
    const todoCheck = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (todoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const result = await pool.query(
      'UPDATE todos SET title = $1, description = $2, priority = $3, due_date = $4, completed = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING *',
      [title, description, priority, due_date || null, completed, id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleTodoComplete = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if todo belongs to user
    const todoCheck = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (todoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    const result = await pool.query(
      'UPDATE todos SET completed = NOT completed, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if todo belongs to user
    const todoCheck = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (todoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};