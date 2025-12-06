import { useState, useEffect } from 'react';
import { Blaze, Blockfrost, Core, WebWallet } from '@blaze-cardano/sdk';

interface CardanoWallet {
  name: string;
  api: any;
  address: string;
  balance: string;
}

export const useCardano = () => {
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [wallet, setWallet] = useState<CardanoWallet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [provider] = useState(() => new Blockfrost({
    network: 'cardano-preview',
    projectId: import.meta.env.VITE_BLOCKFROST_PROJECT_ID,
  }));

  // 🔥 RESTORE WALLET CONNECTION ON PAGE LOAD
  useEffect(() => {
    const initializeWallet = async () => {
      if (typeof window !== 'undefined' && window.cardano) {
        const walletList = Object.keys(window.cardano);
        setAvailableWallets(walletList);

        // 🎯 TRY TO RESTORE PREVIOUS CONNECTION
        const savedWalletName = localStorage.getItem('connectedWallet');
        if (savedWalletName && window.cardano[savedWalletName]) {
          try {
            console.log('🔄 Attempting to restore wallet connection:', savedWalletName);

            // Check if wallet is still accessible
            const isEnabled = await window.cardano[savedWalletName].isEnabled();
            if (isEnabled) {
              await connectWallet(savedWalletName);
              console.log('✅ Wallet connection restored successfully');
            } else {
              console.log('⚠️ Wallet not enabled, clearing saved connection');
              localStorage.removeItem('connectedWallet');
            }
          } catch (error) {
            console.log('⚠️ Failed to restore wallet connection:', error);
            localStorage.removeItem('connectedWallet');
          }
        }
      }
    };

    initializeWallet();
  }, []);

  const connectWallet = async (walletName: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('Connecting to wallet:', walletName);
      if (walletName && (window as any).cardano[walletName]) {
        const api = await (window as any).cardano[walletName].enable();
        console.log('Connected to wallet API:', api);

        const address = await api.getChangeAddress();
        console.log('Wallet address:', address);

        // Get balance
        let balance = '0.000000';
        try {
          const balanceValue = await api.getBalance();
          const lovelaceAmount = parseInt(balanceValue, 16);
          balance = Math.min(parseFloat((lovelaceAmount / 1000000).toFixed(6)), 9999999).toFixed(6);
        } catch (balanceError) {
          console.warn('Could not fetch balance:', balanceError);
        }

        const walletData: CardanoWallet = {
          name: walletName,
          api,
          address,
          balance
        };

        setWallet(walletData);
        setSelectedWallet(walletName);

        // 🎯 SAVE CONNECTION TO LOCALSTORAGE
        localStorage.setItem('connectedWallet', walletName);
        console.log('💾 Wallet connection saved to localStorage');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      localStorage.removeItem('connectedWallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setSelectedWallet('');
    setError('');

    // 🎯 CLEAR SAVED CONNECTION
    localStorage.removeItem('connectedWallet');
    console.log('🔌 Wallet disconnected and localStorage cleared');
  };

  // 🔥 REFRESH BALANCE FUNCTION
  const refreshBalance = async () => {
    if (!wallet) return;

    try {
      const balanceValue = await wallet.api.getBalance();
      const lovelaceAmount = parseInt(balanceValue, 16);
      const newBalance = Math.min(parseFloat((lovelaceAmount / 1000000).toFixed(6)), 9999999).toFixed(6);

      setWallet(prev => prev ? { ...prev, balance: newBalance } : null);
      console.log('💰 Balance refreshed:', newBalance, 'ADA');
    } catch (error) {
      console.warn('Failed to refresh balance:', error);
    }
  };

  // 🚀 REAL TRANSACTION FUNCTION (same as before but with balance refresh)
  const sendADA = async (recipient: string, amountADA: string) => {
    if (!wallet) throw new Error('No wallet connected');

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Creating REAL Cardano transaction through your app...');
      console.log('💰 Amount:', amountADA, 'ADA');
      console.log('📍 To:', recipient);

      // Convert ADA to Lovelace
      const amountLovelace = Math.floor(parseFloat(amountADA) * 1000000);

      // 🔥 Use Lace's NATIVE transaction building
      console.log('🔧 Using Lace native transaction API...');

      // Method 1: Try experimental send API
      try {
        console.log('📡 Attempting direct transaction...');

        const txHash = await wallet.api.experimental.send({
          outputs: [{
            address: recipient,
            amount: amountLovelace
          }]
        });

        if (txHash) {
          console.log('✅ REAL TRANSACTION HASH:', txHash);
          console.log('🌐 Check on CardanoScan:', `https://preview.cardanoscan.io/transaction/${txHash}`);

          // Refresh balance after transaction
          setTimeout(refreshBalance, 3000);

          return txHash;
        }
      } catch (experimentalError) {
        console.log('Experimental API not available, trying standard approach...');
      }

      // Method 2: Standard CIP-30 transaction using Blaze SDK
      console.log('🔧 Building transaction with Blaze SDK...');

      const webWallet = new WebWallet(wallet.api);
      const blaze = await Blaze.from(provider, webWallet);
      console.log('Blaze instance created:', blaze);

      // Convert ADA to Lovelace for Blaze
      const amountLovelaceBigInt = BigInt(amountLovelace);
      console.log('Amount in Lovelace (BigInt):', amountLovelaceBigInt);

      // Build transaction using Blaze SDK
      const tx = await blaze
        .newTransaction()
        .payLovelace(
          Core.Address.fromBech32(recipient),
          amountLovelaceBigInt
        )
        .complete();

      console.log('Transaction built:', tx.toCbor());

      // Sign transaction
      const signedTx = await blaze.signTransaction(tx);
      console.log('Transaction signed:', signedTx.toCbor());

      // Submit to blockchain
      const txHash = await blaze.provider.postTransactionToChain(signedTx);

      console.log('🎉 REAL TRANSACTION SUBMITTED!');
      console.log('🔗 Transaction Hash:', txHash);
      console.log('🌐 Verify on CardanoScan:', `https://preview.cardanoscan.io/transaction/${txHash}`);

      // Refresh balance after successful transaction
      setTimeout(refreshBalance, 5000);

      return txHash;

    } catch (err: any) {
      console.error('❌ Transaction failed:', err);
      setError(`Transaction failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createNoteWithMetadata = async (
    noteId: number,
    noteHash: string,
    customAmount?: string,  // ✅ Optional parameter
    itemTitle?: string,     // ✅ Optional parameter  
    itemType?: 'note' | 'todo',  // ✅ Optional parameter
    noteContent?: string    // ✅ NEW: Optional note content parameter
  ) => {
    if (!wallet) throw new Error('No wallet connected');

    // Use defaults if not provided
    const amount = customAmount || '0.5';
    const title = itemTitle || 'Unknown Item';
    const type = itemType || 'note';

    // Extract action from noteHash (format: "CREATE:Title" or "UPDATE:Title")
    const action = noteHash.split(':')[0] as 'CREATE' | 'UPDATE' | 'DELETE';

    console.log(`🔒 Creating blockchain proof for ${type} ${noteId} with ${amount} ADA...`);
    console.log(`📝 Action: ${action}, Title: ${title}`);

    try {
      const testnetAddress = 'addr_test1qpw0djgj0x59ngrjvqthn7enhvruxnsavsw5th63la3mjel3tkc974sr23jmlzgq5zda4gtv8k9cy38756r9y3qgmkqqjz6aa7';

      console.log(`📍 Sending ${amount} ADA with metadata to testnet address`);

      // 🔥 USE sendTransaction WITH METADATA instead of sendADA
      const proofTx = await sendTransaction(
        testnetAddress,
        amount,
        noteContent || '',  // Note content
        action,             // Action type
        noteId,             // Note ID
        title               // Note title
      );

      console.log(`📝 ${type} ${noteId} secured on blockchain with metadata: ${proofTx}`);

      // 🔥 SAVE TO DATABASE
      await saveBlockchainTransaction(noteId, type, action, title, amount, proofTx);

      return proofTx;
    } catch (error) {
      console.error('Failed to create note proof:', error);
      throw error;
    }
  };

  // 🔥 NEW: Helper function to format content for metadata (handles 64-byte limit)
  const formatContent = (content: string): any => {
    // CASE 1: SHORT STRING (FITS IN ONE CHUNK)
    if (content.length <= 64) {
      return Core.Metadatum.newText(content);
    }

    // CASE 2: LONG STRING (NEEDS SPLITTING)
    // REGEX SPLITS THE STRING EVERY 64 CHARACTERS
    const chunks = content.match(/.{1,64}/g) || [];
    const list = new Core.MetadatumList();

    chunks.forEach(chunk => {
      list.add(Core.Metadatum.newText(chunk));
    });

    return Core.Metadatum.newList(list);
  };

  // 🔥 NEW: Send transaction with metadata for note operations
  const sendTransaction = async (
    targetAddress: string,
    lovelaceAmount: string,
    noteContent: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    noteId?: number,
    noteTitle?: string
  ): Promise<string> => {
    if (!wallet) throw new Error('No wallet connected');

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Building transaction with metadata...');
      console.log('📍 Action:', action);
      console.log('📝 Note ID:', noteId);
      console.log('💰 Amount:', lovelaceAmount, 'ADA');

      // Initialize wallet and Blaze provider
      const webWallet = new WebWallet(wallet.api);
      const blaze = await Blaze.from(provider, webWallet);

      // Convert ADA to Lovelace
      const amountLovelace = BigInt(Math.floor(parseFloat(lovelaceAmount) * 1000000));

      // Start building the transaction
      let tx = blaze
        .newTransaction()
        .payLovelace(
          Core.Address.fromBech32(targetAddress),
          amountLovelace
        );

      // --- METADATA CONSTRUCTION STARTS HERE ---
      // STEP 1: Initialize the top-level container
      const metadata = new Map();

      // STEP 2: Choose a unique label for your app
      const label = 42819n; // Must be a BigInt

      // STEP 3: Create the inner data structure
      const metadatumMap = new Core.MetadatumMap();

      // STEP 4: Insert key-value pairs into the inner map
      // Insert ACTION
      metadatumMap.insert(
        Core.Metadatum.newText("action"),
        Core.Metadatum.newText(action)
      );

      // Insert NOTE CONTENT (with chunking support)
      metadatumMap.insert(
        Core.Metadatum.newText("note"),
        formatContent(noteContent || "")
      );

      // Insert NOTE TITLE (with chunking support)
      if (noteTitle) {
        metadatumMap.insert(
          Core.Metadatum.newText("title"),
          formatContent(noteTitle)
        );
      }

      // Insert NOTE ID
      if (noteId) {
        metadatumMap.insert(
          Core.Metadatum.newText("note_id"),
          Core.Metadatum.newInteger(BigInt(noteId))
        );
      }

      // Insert TIMESTAMP
      metadatumMap.insert(
        Core.Metadatum.newText("created_at"),
        Core.Metadatum.newText(new Date().toISOString())
      );

      // Insert WALLET ADDRESS
      metadatumMap.insert(
        Core.Metadatum.newText("address"),
        formatContent(wallet.address)
      );

      // STEP 5: Wrap the inner MetadatumMap into a generic Metadatum object
      const metadatum = Core.Metadatum.newMap(metadatumMap);

      // STEP 6: Assign the data to your specific label
      metadata.set(label, metadatum);

      // STEP 7: Convert the JavaScript Map to the final Metadata type
      const finalMetadata = new Core.Metadata(metadata);

      // STEP 8: Attach the metadata to the transaction
      tx.setMetadata(finalMetadata);

      // --- FINALIZATION ---
      // Build, sign, and submit the transaction
      const completedTx = await tx.complete();
      console.log('✅ Transaction built with metadata');

      const signedTx = await blaze.signTransaction(completedTx);
      console.log('✅ Transaction signed');

      const txId = await blaze.provider.postTransactionToChain(signedTx);
      console.log('🎉 Transaction submitted to blockchain!');
      console.log('🔗 Transaction Hash:', txId);
      console.log('🌐 View on CardanoScan:', `https://preview.cardanoscan.io/transaction/${txId}`);

      // Refresh balance after transaction
      setTimeout(refreshBalance, 5000);

      return txId;
    } catch (err: any) {
      console.error('❌ Transaction failed:', err);
      setError(`Transaction failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveBlockchainTransaction = async (
    itemId: number,
    itemType: 'note' | 'todo',
    action: string,
    itemTitle: string,
    adaAmount: string,
    txHash: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/blockchain/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          item_id: itemId,
          item_type: itemType,
          action,
          item_title: itemTitle,
          ada_amount: parseFloat(adaAmount),
          tx_hash: txHash
        })
      });
      console.log('✅ Blockchain transaction saved to database');
    } catch (error) {
      console.error('❌ Failed to save blockchain transaction:', error);
    }
  };

  return {
    availableWallets,
    selectedWallet,
    wallet,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    sendADA,
    sendTransaction,
    createNoteWithMetadata,
    refreshBalance,
    saveBlockchainTransaction
  };
};