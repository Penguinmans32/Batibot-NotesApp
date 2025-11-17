import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  saveBlockchainTransaction,
  getBlockchainAnalytics,
  getRecentTransactions
} from '../controllers/blockchainController';

const router = express.Router();

// Save blockchain transaction
router.post('/transaction', authenticateToken, saveBlockchainTransaction);

// Get analytics
router.get('/analytics', authenticateToken, getBlockchainAnalytics);

// Get recent transactions
router.get('/transactions', authenticateToken, getRecentTransactions);

export default router;