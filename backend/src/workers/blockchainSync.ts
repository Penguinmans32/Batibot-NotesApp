import { pool } from '../config/database';
import axios from 'axios';

const BLOCKFROST_API_BASE_URL = 'https://cardano-preview.blockfrost.io/api/v0';
const BLOCKFROST_PROJECT_ID = process.env.BLOCKFROST_PROJECT_ID;
const SYNC_INTERVAL = 20000; // 20 seconds

interface PendingNote {
  id: number;
  user_id: number;
  title: string;
  content: string;
  tx_hash: string;
  address: string;
  status: string;
}

/**
 * Check if a transaction is confirmed on the blockchain using Blockfrost API
 */
const checkTransactionStatus = async (txHash: string): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${BLOCKFROST_API_BASE_URL}/txs/${txHash}`,
      {
        headers: {
          'project_id': BLOCKFROST_PROJECT_ID
        }
      }
    );

    // If we get a 200 OK response, the transaction is confirmed
    if (response.status === 200) {
      console.log(`✅ Transaction ${txHash} is confirmed on blockchain`);
      return true;
    }

    return false;
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Transaction not yet confirmed
      console.log(`⏳ Transaction ${txHash} not yet confirmed`);
      return false;
    }

    // Other errors (network issues, rate limiting, etc.)
    console.error(`❌ Error checking transaction ${txHash}:`, error.message);
    return false;
  }
};

/**
 * Update note status to confirmed in the database
 */
const updateNoteToConfirmed = async (noteId: number): Promise<void> => {
  try {
    await pool.query(
      'UPDATE notes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['confirmed', noteId]
    );
    console.log(`📝 Note ${noteId} status updated to confirmed`);
  } catch (error) {
    console.error(`❌ Failed to update note ${noteId} status:`, error);
  }
};

/**
 * Main sync function that checks all pending notes
 */
export const syncPendingTransactions = async (): Promise<void> => {
  try {
    // Query all notes with pending status that have a tx_hash
    const result = await pool.query<PendingNote>(
      'SELECT id, user_id, title, content, tx_hash, address, status FROM notes WHERE status = $1 AND tx_hash IS NOT NULL',
      ['pending']
    );

    const pendingNotes = result.rows;

    if (pendingNotes.length === 0) {
      console.log('📭 No pending transactions to check');
      return;
    }

    console.log(`🔍 Checking ${pendingNotes.length} pending transaction(s)...`);

    // Check each pending transaction
    for (const note of pendingNotes) {
      const isConfirmed = await checkTransactionStatus(note.tx_hash);

      if (isConfirmed) {
        await updateNoteToConfirmed(note.id);
      }
    }

    console.log('✅ Blockchain sync completed');
  } catch (error) {
    console.error('❌ Error during blockchain sync:', error);
  }
};

/**
 * Start the blockchain sync worker
 */
export const startBlockchainSyncWorker = (): void => {
  console.log('🚀 Starting blockchain sync worker...');
  console.log(`⏰ Sync interval: ${SYNC_INTERVAL / 1000} seconds`);

  // Run immediately on start
  syncPendingTransactions();

  // Then run every SYNC_INTERVAL
  setInterval(async () => {
    console.log('\n⏰ Running scheduled blockchain sync...');
    await syncPendingTransactions();
  }, SYNC_INTERVAL);
};

/**
 * Retrieve note metadata from blockchain using Blockfrost API
 */
export const retrieveNoteFromBlockchain = async (txHash: string): Promise<any> => {
  try {
    const response = await axios.get(
      `${BLOCKFROST_API_BASE_URL}/txs/${txHash}/metadata`,
      {
        headers: {
          'project_id': BLOCKFROST_PROJECT_ID
        }
      }
    );

    if (response.status === 200 && response.data.length > 0) {
      // Find metadata with label 42819
      const noteMetadata = response.data.find((meta: any) => meta.label === '42819');
      
      if (noteMetadata) {
        console.log(`📝 Retrieved note metadata from blockchain:`, noteMetadata);
        return noteMetadata.json_metadata;
      }
    }

    return null;
  } catch (error: any) {
    console.error(`❌ Error retrieving note metadata from blockchain:`, error.message);
    return null;
  }
};

/**
 * Recover all notes from blockchain for a specific wallet address
 */
export const recoverNotesFromBlockchain = async (walletAddress: string, userId: number): Promise<number> => {
  try {
    console.log(`🔄 Recovering notes from blockchain for address: ${walletAddress}`);

    // Get all transactions for the address
    const response = await axios.get(
      `${BLOCKFROST_API_BASE_URL}/addresses/${walletAddress}/transactions`,
      {
        headers: {
          'project_id': BLOCKFROST_PROJECT_ID
        }
      }
    );

    if (response.status !== 200) {
      return 0;
    }

    let recoveredCount = 0;

    // Check each transaction for our metadata label
    for (const tx of response.data) {
      const txHash = tx.tx_hash;
      const metadata = await retrieveNoteFromBlockchain(txHash);

      if (metadata) {
        // Reconstruct note content from metadata
        let noteContent = '';
        if (typeof metadata.note === 'string') {
          noteContent = metadata.note;
        } else if (Array.isArray(metadata.note)) {
          // Concatenate chunked content
          noteContent = metadata.note.join('');
        }

        let noteTitle = '';
        if (metadata.title) {
          if (typeof metadata.title === 'string') {
            noteTitle = metadata.title;
          } else if (Array.isArray(metadata.title)) {
            noteTitle = metadata.title.join('');
          }
        }

        // Check if note already exists in database
        const existingNote = await pool.query(
          'SELECT id FROM notes WHERE tx_hash = $1 AND user_id = $2',
          [txHash, userId]
        );

        if (existingNote.rows.length === 0) {
          // Insert recovered note into database
          await pool.query(
            'INSERT INTO notes (user_id, title, content, status, address, tx_hash, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [
              userId,
              noteTitle || 'Recovered Note',
              noteContent,
              'confirmed',
              walletAddress,
              txHash,
              metadata.created_at ? new Date(metadata.created_at) : new Date()
            ]
          );

          recoveredCount++;
          console.log(`✅ Recovered note from tx: ${txHash}`);
        }
      }
    }

    console.log(`🎉 Recovery complete! Recovered ${recoveredCount} note(s)`);
    return recoveredCount;
  } catch (error: any) {
    console.error(`❌ Error recovering notes from blockchain:`, error.message);
    return 0;
  }
};
