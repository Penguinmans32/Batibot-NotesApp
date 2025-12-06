import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  bulkDeleteNotes,
  toggleNoteFavorite,
  getDeletedNotes,
  restoreNote,
  permanentlyDeleteNote,
  bulkRestoreNotes,
  bulkPermanentlyDeleteNotes,
  getPendingNotes,
  updateNoteStatus,
  updateNoteBlockchainInfo
} from '../controllers/notesController';

const router = express.Router();

// Regular notes routes
router.get('/', authenticateToken, getNotes);
router.post('/', authenticateToken, createNote);
router.put('/:id', authenticateToken, updateNote);
router.patch('/:id', authenticateToken, updateNoteBlockchainInfo); // 🔥 NEW: Update with blockchain info
router.delete('/:id', authenticateToken, deleteNote);

// Bulk operations
router.post('/bulk-delete', authenticateToken, bulkDeleteNotes);

// Favorite toggle
router.patch('/:id/favorite', authenticateToken, toggleNoteFavorite);

// Blockchain sync routes
router.get('/pending', authenticateToken, getPendingNotes);
router.patch('/:id/status', authenticateToken, updateNoteStatus);

// Recycle bin routes
router.get('/recycle-bin', authenticateToken, getDeletedNotes);
router.patch('/recycle-bin/:id/restore', authenticateToken, restoreNote);
router.delete('/recycle-bin/:id', authenticateToken, permanentlyDeleteNote);
router.post('/recycle-bin/bulk-restore', authenticateToken, bulkRestoreNotes);
router.post('/recycle-bin/bulk-delete', authenticateToken, bulkPermanentlyDeleteNotes);

export default router;
