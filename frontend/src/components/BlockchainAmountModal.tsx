import React, { useState } from 'react';
import { Coins, Shield, X, AlertTriangle } from 'lucide-react';

interface BlockchainAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: string) => Promise<void>;
  action: string; // 'create', 'update', 'delete', etc.
  title: string;
  itemType: 'Note' | 'Todo';
  loading: boolean;
}

const BlockchainAmountModal: React.FC<BlockchainAmountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  title,
  itemType,
  loading
}) => {
  const [adaAmount, setAdaAmount] = useState('0.5');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const amount = parseFloat(adaAmount);
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid ADA amount');
      return;
    }
    
    if (amount < 0.1) {
      setError('Minimum amount is 0.1 ADA');
      return;
    }
    
    if (amount > 100) {
      setError('Maximum amount is 100 ADA');
      return;
    }

    setError('');
    
    try {
      await onConfirm(adaAmount);
    } catch (err) {
      setError('Transaction failed. Please try again.');
    }
  };

  const getActionEmoji = () => {
    switch (action) {
      case 'create': return '🎉';
      case 'update': return '✏️';  
      case 'delete': return '🗑️';
      case 'complete': return '✅';
      case 'reopen': return '🔄';
      default: return '🔗';
    }
  };

  const getActionColor = () => {
    switch (action) {
      case 'create': return 'from-green-400 to-emerald-500';
      case 'update': return 'from-blue-400 to-cyan-500';
      case 'delete': return 'from-red-400 to-pink-500';
      case 'complete': return 'from-green-400 to-teal-500';
      case 'reopen': return 'from-orange-400 to-amber-500';
      default: return 'from-purple-400 to-indigo-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl transform animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 bg-gradient-to-r ${getActionColor()} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <div className="text-2xl">
              {getActionEmoji()}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Secure on Blockchain
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {itemType} will be {action}d and recorded on Cardano blockchain
          </p>
        </div>

        {/* Item Details */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {itemType} to Secure
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">
            "{title}"
          </p>
        </div>

        {/* ADA Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <Coins className="w-4 h-4 inline mr-2" />
            ADA Amount for Blockchain Transaction
          </label>
          
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={adaAmount}
              onChange={(e) => {
                setAdaAmount(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="0.5"
              disabled={loading}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">ADA</span>
            </div>
          </div>
          
          {error && (
            <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            • Minimum: 0.1 ADA  • Maximum: 100 ADA  • Recommended: 0.5-2 ADA
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick amounts:</p>
          <div className="grid grid-cols-4 gap-2">
            {['0.5', '1.0', '2.0', '5.0'].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setAdaAmount(amount);
                  setError('');
                }}
                disabled={loading}
                className="py-2 px-3 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-800/30 text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 rounded-lg transition-colors disabled:opacity-50"
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={loading || !!error}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Secure with {adaAmount} ADA</span>
              </>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl p-3">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Blockchain Security</p>
              <p>This creates an immutable record on Cardano blockchain. The ADA amount represents the value of securing this {itemType.toLowerCase()}.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainAmountModal;