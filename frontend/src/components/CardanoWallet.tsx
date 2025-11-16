import React, { useState } from 'react';
import { Wallet, Send, Shield, Copy, ExternalLink, X } from 'lucide-react';
import { useCardanoContext } from '../contexts/CardanoContext';
import TransactionSuccessModal from './TranscationModelSuccess';
import SecureNoteModal from './SecureNoteModal';

interface CardanoWalletProps {
  className?: string;
  notes: any[]; // Remove the ? to make it required
  onRefreshNotes?: () => void;
}

const CardanoWallet: React.FC<CardanoWalletProps> = ({ className, notes = [], onRefreshNotes }) => {
  const {
    availableWallets,
    selectedWallet,
    wallet,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    sendADA,
    createNoteWithMetadata
    } = useCardanoContext();

  const [localSelectedWallet, setLocalSelectedWallet] = useState<string>('');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [isSecureNoteModalOpen, setIsSecureNoteModalOpen] = useState(false);

  // 🎯 SUCCESS MODAL STATE
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState('');
  const [successAmount, setSuccessAmount] = useState('');
  const [successRecipient, setSuccessRecipient] = useState('');

  const formatADA = (balance: string): string => {
    return parseFloat(balance).toFixed(6);
  };

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.address);
    }
  };

  const handleSendTransaction = async () => {
    if (!recipient || !amount) return;

    setTransactionLoading(true);

    try {
      // 🚀 REAL TRANSACTION CALL
      const txHash = await sendADA(recipient, amount);
      
      // 🎯 STORE SUCCESS DATA FOR BEAUTIFUL MODAL
      setSuccessTxHash(txHash);
      setSuccessAmount(amount);
      setSuccessRecipient(recipient);
      
      // Clear form
      setRecipient('');
      setAmount('');
      
      // Close transaction modal and open success modal
      setIsTransactionModalOpen(false);
      setIsSuccessModalOpen(true);
      
    } catch (err: any) {
      console.error('Transaction failed:', err);
    } finally {
      setTransactionLoading(false);
    }
  };

  if (!wallet) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-3xl p-6 border border-blue-200 dark:border-blue-500/30 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Cardano Wallet</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">Connect to send ADA & secure notes</p>
          </div>
        </div>

        {availableWallets.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-blue-800 dark:text-blue-200 mb-2">No Cardano wallets detected</p>
            <a 
              href="https://www.lace.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm inline-flex items-center"
            >
              Install Lace Wallet <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        ) : (
          <div>
            <select
              value={localSelectedWallet}
              onChange={(e) => setLocalSelectedWallet(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-xl px-4 py-3 text-blue-900 dark:text-blue-100 mb-4"
            >
              <option value="">Select Wallet</option>
              {availableWallets.map(walletName => (
                <option key={walletName} value={walletName}>
                  {walletName.charAt(0).toUpperCase() + walletName.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={() => localSelectedWallet && connectWallet(localSelectedWallet)}
              disabled={!localSelectedWallet || loading}
              className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 rounded-xl text-red-800 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 rounded-3xl p-6 border border-green-200 dark:border-green-500/30 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                {selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1)} Connected
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">Ready for transactions</p>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="p-2 hover:bg-green-200 dark:hover:bg-green-800/30 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-green-700 dark:text-green-300" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-green-200 dark:border-green-600/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-800 dark:text-green-200 font-medium">Balance:</span>
              <span className="text-2xl font-bold text-green-900 dark:text-green-100">
                ₳{formatADA(wallet.balance)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-green-700 dark:text-green-300 text-xs font-mono truncate flex-1">
                {wallet.address.slice(0, 20)}...{wallet.address.slice(-10)}
              </span>
              <button
                onClick={copyAddress}
                className="p-1 hover:bg-green-200 dark:hover:bg-green-700/30 rounded transition-colors"
              >
                <Copy className="w-3 h-3 text-green-600 dark:text-green-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsTransactionModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send ADA</span>
            </button>
            
           <button 
                onClick={() => setIsSecureNoteModalOpen(true)}
                className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                <Shield className="w-4 h-4" />
                <span>Secure Note</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 rounded-xl text-red-800 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* 🎯 BEAUTIFUL SUCCESS MODAL */}
      <TransactionSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        txHash={successTxHash}
        amount={successAmount}
        recipient={successRecipient}
      />

      {/* Transaction Modal */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send ADA</h3>
              <button
                onClick={() => setIsTransactionModalOpen(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="addr_test1..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (ADA)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.000000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Available: ₳{formatADA(wallet.balance)}
                </p>
              </div>

              <button
                onClick={handleSendTransaction}
                disabled={!recipient || !amount || transactionLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {transactionLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Transaction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Secure Note Modal */}   
        <SecureNoteModal
        isOpen={isSecureNoteModalOpen}
        onClose={() => setIsSecureNoteModalOpen(false)}
        onSecureNote={createNoteWithMetadata}
        notes={notes}
        />
    </>
  );
};

export default CardanoWallet;