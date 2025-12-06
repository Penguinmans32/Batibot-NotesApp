# Quick Start Guide - Blockchain Metadata Integration

## ✅ What's Been Implemented

Your Notes App now has full blockchain integration with:
- ✅ Metadata attachment to all note operations (CREATE, UPDATE, DELETE)
- ✅ 64-byte chunking for long note content
- ✅ Automatic background worker syncing every 20 seconds
- ✅ Status tracking (pending → confirmed)
- ✅ Recovery function to rebuild database from blockchain
- ✅ UI status badges showing transaction state

## 🚀 How to Use

### 1. Install Backend Dependencies
```bash
cd backend
npm install axios
```

### 2. Add Blockfrost API Key
Get your FREE Blockfrost API key from: https://blockfrost.io

**backend/.env:**
```env
BLOCKFROST_PROJECT_ID=previewYourProjectIdHere
```

**frontend/.env:**
```env
VITE_BLOCKFROST_PROJECT_ID=previewYourProjectIdHere
```

### 3. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

You should see in backend console:
```
🚀 Starting blockchain sync worker...
⏰ Sync interval: 20 seconds
```

## 📝 Using Blockchain Features

### Creating a Note with Blockchain Proof

The current implementation already handles this automatically:

1. **Connect Wallet** - Click wallet button and connect Lace/Nami
2. **Create Note** - Click "+ New Note" button
3. **Enter Content** - Add title and content
4. **Save** - Click Save
5. **Blockchain Modal** - Enter ADA amount (e.g., 2.0)
6. **Confirm Transaction** - Approve in wallet

**What happens:**
- Note saved to database instantly (status: "pending")
- Transaction sent to blockchain with metadata
- Background worker checks every 20 seconds
- Status updates to "confirmed" after ~20 seconds

### Viewing Status

Each note displays a status badge:
- 🟡 **⏳ Pending** - Transaction sent, waiting for blockchain confirmation
- 🟢 **✓ Confirmed** - Transaction found on blockchain

### Recovering Notes from Blockchain

If your database is deleted, you can recover all notes:

```typescript
// Add this function to your Dashboard or create a Recovery component
const handleRecoverNotes = async () => {
  if (!wallet) {
    alert('Please connect your wallet first');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/notes/recover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        walletAddress: wallet.address
      })
    });
    
    const data = await response.json();
    alert(`Recovered ${data.count} notes from blockchain!`);
    
    // Reload notes
    fetchNotes();
  } catch (error) {
    console.error('Recovery failed:', error);
  }
};
```

## 🔍 Verifying Blockchain Transactions

### View on CardanoScan:
```
https://preview.cardanoscan.io/transaction/{tx_hash}
```

### View Metadata:
1. Open transaction on CardanoScan
2. Click "Metadata" tab
3. Look for label "42819"
4. See your note data:
   ```json
   {
     "action": "CREATE",
     "note": "Your note content...",
     "title": "Your note title",
     "note_id": 123,
     "created_at": "2025-12-06T...",
     "address": "addr_test1..."
   }
   ```

## 📊 Monitoring the System

### Check Pending Transactions:
```bash
# In PostgreSQL
SELECT id, title, status, tx_hash, created_at 
FROM notes 
WHERE status = 'pending';
```

### Check Worker Logs:
Backend console will show:
```
⏰ Running scheduled blockchain sync...
🔍 Checking 3 pending transaction(s)...
⏳ Transaction abc123... not yet confirmed
✅ Transaction def456... is confirmed on blockchain
📝 Note 42 status updated to confirmed
✅ Blockchain sync completed
```

## 🎯 Next Steps (Optional Enhancements)

1. **Add Recovery Button to UI:**
   - Create "Recover from Blockchain" button in Dashboard
   - Call recovery endpoint when clicked
   - Show progress indicator

2. **Display Transaction Link:**
   - Add clickable link on each note
   - Opens CardanoScan to view transaction

3. **Show Pending Count:**
   - Display badge in header: "3 Pending Confirmations"
   - Updates in real-time

4. **Add Retry Logic:**
   - If transaction fails, show retry button
   - Allows user to resend transaction

## ⚠️ Important Notes

1. **Testnet Only**: Currently using Cardano Preview testnet
2. **Free Testnet ADA**: Get free test ADA from Cardano faucet
3. **Transaction Time**: ~20 seconds for confirmation
4. **Metadata Limit**: 64 bytes per string (handled by chunking)
5. **Label Uniqueness**: Using label 42819 (not reserved)

## 🐛 Troubleshooting

### Worker Not Running?
- Check backend console for error messages
- Verify BLOCKFROST_PROJECT_ID is set
- Ensure axios is installed: `npm install axios`

### Status Not Updating?
- Check worker is running (should log every 20 seconds)
- Verify tx_hash is saved in database
- Check Blockfrost API quota (free tier: 50,000 requests/day)

### Transaction Failed?
- Ensure wallet has sufficient balance
- Check network connection
- Verify Blockfrost project ID is correct

## 📚 API Endpoints

### Get Pending Notes:
```
GET /api/notes/pending
Authorization: Bearer {token}
```

### Update Note Status:
```
PATCH /api/notes/:id/status
Authorization: Bearer {token}
Body: { "status": "confirmed" }
```

### Recover Notes:
```
POST /api/notes/recover
Authorization: Bearer {token}
Body: { "walletAddress": "addr_test1..." }
```

## ✨ Success Checklist

- [ ] Backend dependencies installed (axios)
- [ ] Blockfrost API key added to .env files
- [ ] Backend server running with worker logs
- [ ] Frontend connected to backend
- [ ] Wallet connected successfully
- [ ] Created test note with blockchain proof
- [ ] Saw status change from "pending" to "confirmed"
- [ ] Verified transaction on CardanoScan
- [ ] Metadata visible with label 42819

## 🎓 Learning Resources

- Blockfrost API Docs: https://docs.blockfrost.io
- Cardano Metadata Standard: CIP-0020
- CardanoScan Preview: https://preview.cardanoscan.io
- Blaze SDK: https://github.com/butaneprotocol/blaze-cardano

---

**Questions?** Check the logs in backend console and browser console for detailed debugging information.
