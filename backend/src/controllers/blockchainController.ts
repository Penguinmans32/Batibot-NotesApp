import { Request, Response } from 'express';
import { pool } from '../config/database';

interface AuthRequest extends Request {
  user?: any;
}

// Save blockchain transaction
export const saveBlockchainTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      item_id, 
      item_type, 
      action, 
      item_title, 
      ada_amount, 
      tx_hash 
    } = req.body;

    if (!item_id || !item_type || !action || !item_title || !ada_amount || !tx_hash) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await pool.query(
      `INSERT INTO blockchain_transactions 
       (user_id, item_id, item_type, action, item_title, ada_amount, tx_hash) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [req.user.id, item_id, item_type, action, item_title, ada_amount, tx_hash]
    );

    console.log(`🔗 Blockchain transaction saved: ${action} ${item_type} ${item_id} - ${ada_amount} ADA`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving blockchain transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get blockchain analytics for user
export const getBlockchainAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Get total transactions count
    const totalTransactionsResult = await pool.query(
      'SELECT COUNT(*) as count FROM blockchain_transactions WHERE user_id = $1',
      [req.user.id]
    );

    // Get total ADA spent
    const totalADAResult = await pool.query(
      'SELECT SUM(ada_amount) as total FROM blockchain_transactions WHERE user_id = $1',
      [req.user.id]
    );

    // Get average transaction amount
    const avgAmountResult = await pool.query(
      'SELECT AVG(ada_amount) as avg FROM blockchain_transactions WHERE user_id = $1',
      [req.user.id]
    );

    // Get most expensive transaction
    const mostExpensiveResult = await pool.query(
      `SELECT * FROM blockchain_transactions 
       WHERE user_id = $1 
       ORDER BY ada_amount DESC 
       LIMIT 1`,
      [req.user.id]
    );

    // Get first and latest transactions
    const firstTransactionResult = await pool.query(
      `SELECT * FROM blockchain_transactions 
       WHERE user_id = $1 
       ORDER BY created_at ASC 
       LIMIT 1`,
      [req.user.id]
    );

    const latestTransactionResult = await pool.query(
      `SELECT * FROM blockchain_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [req.user.id]
    );

    // Get action breakdown
    const actionBreakdownResult = await pool.query(
      `SELECT action, COUNT(*) as count 
       FROM blockchain_transactions 
       WHERE user_id = $1 
       GROUP BY action`,
      [req.user.id]
    );

    // Get security levels breakdown
    const securityLevelsResult = await pool.query(
      `SELECT 
         CASE 
           WHEN ada_amount < 1 THEN 'Bronze (< 1 ADA)'
           WHEN ada_amount < 3 THEN 'Silver (1-3 ADA)'
           WHEN ada_amount < 5 THEN 'Gold (3-5 ADA)'
           ELSE 'Diamond (5+ ADA)'
         END as level,
         COUNT(*) as count
       FROM blockchain_transactions 
       WHERE user_id = $1 
       GROUP BY 
         CASE 
           WHEN ada_amount < 1 THEN 'Bronze (< 1 ADA)'
           WHEN ada_amount < 3 THEN 'Silver (1-3 ADA)'
           WHEN ada_amount < 5 THEN 'Gold (3-5 ADA)'
           ELSE 'Diamond (5+ ADA)'
         END`,
      [req.user.id]
    );

    // Get monthly spending
    const monthlySpendingResult = await pool.query(
      `SELECT 
         TO_CHAR(created_at, 'Mon YYYY') as month,
         SUM(ada_amount) as total
       FROM blockchain_transactions 
       WHERE user_id = $1 
       GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at)`,
      [req.user.id]
    );

    // Format the data
    const analytics = {
      totalTransactions: parseInt(totalTransactionsResult.rows[0]?.count || '0'),
      totalADASpent: parseFloat(totalADAResult.rows[0]?.total || '0'),
      avgTransactionAmount: parseFloat(avgAmountResult.rows[0]?.avg || '0'),
      mostExpensiveTransaction: mostExpensiveResult.rows[0] || null,
      firstTransaction: firstTransactionResult.rows[0] || null,
      latestTransaction: latestTransactionResult.rows[0] || null,
      actionBreakdown: actionBreakdownResult.rows.reduce((acc, row) => {
        acc[row.action] = parseInt(row.count);
        return acc;
      }, {}),
      securityLevels: securityLevelsResult.rows.reduce((acc, row) => {
        acc[row.level] = parseInt(row.count);
        return acc;
      }, {}),
      monthlySpending: monthlySpendingResult.rows.reduce((acc, row) => {
        acc[row.month] = parseFloat(row.total);
        return acc;
      }, {})
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching blockchain analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent transactions
export const getRecentTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await pool.query(
      `SELECT * FROM blockchain_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [req.user.id, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};