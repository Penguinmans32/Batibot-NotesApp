# Blockchain Metadata Implementation - Complete Guide

## Overview
This implementation adds full blockchain integration to your Notes App with metadata support, transaction tracking, and automatic synchronization.

## Key Features Implemented

### 1. **Database Schema Updates**
- Added `status` column: tracks 'pending' or 'confirmed' state
- Added `address` column: stores wallet address for each note operation
- Added `tx_hash` column: stores blockchain transaction hash
- Added indexes for efficient querying

### 2. **Metadata Chunking**
Implemented proper 64-byte chunking for Cardano metadata:
```typescript
const formatContent = (content: string): any => {
  if (content.length <= 64) {
    return Core.Metadatum.newText(content);
  }
  
  // Split into 64-character chunks
  const chunks = content.match(/.{1,64}/g) || [];
  const list = new Core.MetadatumList();
  chunks.forEach(chunk => {
    list.add(Core.Metadatum.newText(chunk));
  });
  return Core.Metadatum.newList(list);
};
```

### 3. **Transaction with Metadata**
New `sendTransaction` function in `useCardano.ts`:
- Builds transaction with Blaze SDK
- Attaches metadata with label `42819n`
- Includes: action, note content, title, note_id, timestamp, wallet address
- Handles long strings with chunking

**Metadata Structure:**
```json
{
  "42819": {
    "action": "CREATE|UPDATE|DELETE",
    "note": "note content (chunked if >64 bytes)",
    "title": "note title (chunked if >64 bytes)",
    "note_id": 123,
    "created_at": "2025-12-06T...",
    "address": "wallet address"
  }
}
```

### 4. **Backend Integration**

#### Updated Controllers:
- **createNote**: Sets status='pending', stores address & tx_hash
- **updateNote**: Sets status='pending', stores address & tx_hash
- **deleteNote**: Sets status='pending', stores address & tx_hash
- **getPendingNotes**: Returns all notes with status='pending'
- **updateNoteStatus**: Updates note status to 'confirmed'

#### New Routes:
```typescript
GET  /api/notes/pending      // Get pending notes
PATCH /api/notes/:id/status  // Update note status
```

### 5. **Background Blockchain Sync Worker**

**Location**: `backend/src/workers/blockchainSync.ts`

**Features:**
- Runs every 20 seconds automatically
- Queries all pending notes from database
- Checks each tx_hash using Blockfrost API
- Updates status to 'confirmed' when transaction is found on-chain

**Blockfrost API Integration:**
```typescript
GET https://cardano-preview.blockfrost.io/api/v0/txs/{hash}
- 200 OK = Transaction confirmed
- 404 Not Found = Transaction pending
```

**Auto-start in server.ts:**
```typescript
app.listen(PORT, () => {
  startBlockchainSyncWorker(); // ✅ Starts on server launch
});
```

### 6. **Blockchain Recovery Function**

**Purpose**: Recover notes from blockchain when database is deleted

**Function**: `recoverNotesFromBlockchain(walletAddress, userId)`

**How it works:**
1. Queries all transactions for wallet address
2. Retrieves metadata from each transaction
3. Finds metadata with label `42819`
4. Reconstructs note content from chunked metadata
5. Inserts recovered notes into database with status='confirmed'

**Usage:**
```typescript
const recovered = await recoverNotesFromBlockchain(walletAddress, userId);
console.log(`Recovered ${recovered} notes from blockchain`);
```

## Usage Flow

### Creating a Note with Blockchain Proof:

```typescript
// Frontend - Dashboard or NoteModal
const { wallet, sendTransaction } = useCardanoContext();

// 1. Create note in database first (for instant UX)
const response = await fetch('http://localhost:5000/api/notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: noteTitle,
    content: noteContent,
    tags: [],
    address: wallet.address
  })
});

const newNote = await response.json();

// 2. Send blockchain transaction with metadata
try {
  const txHash = await sendTransaction(
    'addr_test1qpw0djgj0x59ngrjvqthn7enhvruxnsavsw5th63la3mjel3tkc974sr23jmlzgq5zda4gtv8k9cy38756r9y3qgmkqqjz6aa7',
    '2.0', // ADA amount
    noteContent,
    'CREATE',
    newNote.id,
    noteTitle
  );
  
  // 3. Update note with tx_hash
  await fetch(`http://localhost:5000/api/notes/${newNote.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...newNote,
      tx_hash: txHash,
      status: 'pending'
    })
  });
  
  // Note will show as "pending" in UI
  // Background worker will update to "confirmed" after ~20 seconds
  
} catch (error) {
  console.error('Blockchain transaction failed:', error);
}
```

### Updating a Note:

```typescript
// Similar flow but action = 'UPDATE'
const txHash = await sendTransaction(
  targetAddress,
  '1.5',
  updatedContent,
  'UPDATE',
  noteId,
  updatedTitle
);
```

### Deleting a Note:

```typescript
// Similar flow but action = 'DELETE'
const txHash = await sendTransaction(
  targetAddress,
  '1.0',
  noteContent,
  'DELETE',
  noteId,
  noteTitle
);
```

## Status Display in UI

Notes should display their blockchain status:
- 🟡 **Pending**: Transaction sent but not yet confirmed (~20 seconds)
- 🟢 **Confirmed**: Transaction found on blockchain

**UI Component Example:**
```tsx
{note.status === 'pending' && (
  <span className="text-yellow-500 text-xs">
    ⏳ Pending
  </span>
)}
{note.status === 'confirmed' && (
  <span className="text-green-500 text-xs">
    ✅ Confirmed
  </span>
)}
```

## Environment Variables

**Backend (.env):**
```env
BLOCKFROST_PROJECT_ID=your_blockfrost_project_id_here
```

**Frontend (.env):**
```env
VITE_BLOCKFROST_PROJECT_ID=your_blockfrost_project_id_here
```

## Installation & Setup

1. **Install dependencies:**
```bash
cd backend
npm install axios
```

2. **Add Blockfrost Project ID to .env files**

3. **Restart backend server:**
```bash
npm run dev
```

The blockchain sync worker will start automatically and begin checking pending transactions every 20 seconds.

## Testing the Implementation

### Test Create Operation:
1. Connect Cardano wallet
2. Create a new note
3. Note appears immediately with status "pending"
4. Wait ~20 seconds
5. Worker checks blockchain
6. Status updates to "confirmed" when transaction is found

### Test Recovery:
1. Delete local database notes
2. Call recovery function with wallet address
3. All notes with metadata label 42819 are recovered
4. Notes appear with status "confirmed"

## Important Notes

- **Bad UX Prevention**: Notes are saved to database FIRST for instant display, then blockchain transaction is sent in background
- **Automatic Sync**: Worker runs continuously every 20 seconds to check pending transactions
- **Permanent Record**: Blockchain acts as permanent source of truth, database is cache
- **Metadata Label**: `42819n` is unique to this app (not reserved by Cardano Foundation)
- **Preview Network**: Using Cardano Preview testnet for development

## Verification

**Check transaction on CardanoScan:**
```
https://preview.cardanoscan.io/transaction/{tx_hash}
```

**View metadata in transaction:**
- Navigate to transaction on CardanoScan
- Click "Metadata" tab
- Look for label "42819"
- See your note content, action, timestamp, etc.

## Architecture Benefits

1. **Fast UX**: Database provides instant feedback
2. **Permanent Storage**: Blockchain provides immutable record
3. **Automatic Sync**: Worker handles confirmation without user interaction
4. **Recovery**: Can rebuild database from blockchain
5. **Audit Trail**: All note operations recorded on-chain with metadata
6. **Decentralized**: Notes exist on blockchain independent of your server

## Next Steps for UI Enhancement

You should update the Dashboard component to:
1. Display status badges on each note
2. Show tx_hash as clickable link to CardanoScan
3. Add "Recover from Blockchain" button
4. Show pending transaction count in header
5. Add loading indicators during blockchain operations
