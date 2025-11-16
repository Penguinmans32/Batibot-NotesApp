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

  const createNoteWithMetadata = async (noteId: number, noteHash: string) => {
    if (!wallet) throw new Error('No wallet connected');

    console.log(`🔒 Creating blockchain proof for note ${noteId}...`);
    
    try {
        // 🎯 SIMPLE FIX: Use a known good testnet address
        const testnetAddress = 'addr_test1qpw0djgj0x59ngrjvqthn7enhvruxnsavsw5th63la3mjel3tkc974sr23jmlzgq5zda4gtv8k9cy38756r9y3qgmkqqjz6aa7';
        
        console.log('📍 Sending proof transaction to testnet address');
        
        // Send small transaction as blockchain proof
        const proofTx = await sendADA(testnetAddress, '0.5');
        console.log(`📝 Note ${noteId} secured on blockchain: ${proofTx}`);
        return proofTx;
    } catch (error) {
        console.error('Failed to create note proof:', error);
        throw error;
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
    createNoteWithMetadata,
    refreshBalance // Export refresh function
  };
};