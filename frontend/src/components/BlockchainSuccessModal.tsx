import React from 'react';
import { Check, Copy, ExternalLink, X, Shield } from 'lucide-react';

interface BlockchainSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash: string;
  action: string; // 'created', 'updated', 'deleted'
  title: string;
  itemType: 'Note' | 'Todo';
}

const BlockchainSuccessModal: React.FC<BlockchainSuccessModalProps> = ({
  isOpen,
  onClose,
  txHash,
  action,
  title,
  itemType
}) => {
  if (!isOpen) return null;

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash);
    
    // Show brief confirmation
    const button = document.getElementById('copy-btn');
    if (button) {
      button.innerHTML = '✅ Copied!';
      setTimeout(() => {
        button.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>';
      }, 2000);
    }
  };

  const openCardanoScan = () => {
    window.open(`https://preview.cardanoscan.io/transaction/${txHash}`, '_blank');
  };

  const getActionEmoji = () => {
    switch (action) {
      case 'created': return '🎉';
      case 'updated': return '✏️';
      case 'deleted': return '🗑️';
      case 'completed': return '✅';
      case 'reopened': return '🔄';
      default: return '🔗';
    }
  };

  const getActionColor = () => {
    switch (action) {
      case 'created': return 'from-green-400 to-emerald-500';
      case 'updated': return 'from-blue-400 to-cyan-500';
      case 'deleted': return 'from-red-400 to-pink-500';
      case 'completed': return 'from-green-400 to-teal-500';
      case 'reopened': return 'from-orange-400 to-amber-500';
      default: return 'from-purple-400 to-indigo-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl transform animate-in zoom-in-95 duration-300">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className={`w-20 h-20 bg-gradient-to-r ${getActionColor()} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <div className="text-3xl">
              {getActionEmoji()}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {itemType} {action.charAt(0).toUpperCase() + action.slice(1)} Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Permanently secured on Cardano blockchain
          </p>
        </div>

        {/* Item Details */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              {itemType} Details
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            "{title}"
          </p>
        </div>

        {/* Transaction Hash */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              🔗 Blockchain Proof Hash
            </span>
            <button
              id="copy-btn"
              onClick={copyTxHash}
              className="p-2 hover:bg-blue-200 dark:hover:bg-blue-800/30 rounded-lg transition-colors"
              title="Copy transaction hash"
            >
              <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
          <div className="font-mono text-xs text-blue-900 dark:text-blue-200 break-all bg-white dark:bg-gray-800 p-3 rounded-lg border">
            {txHash}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={openCardanoScan}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Verify on CardanoScan</span>
          </button>
          
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Verification Badge */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium border border-green-200 dark:border-green-700">
            <Check className="w-4 h-4" />
            <span>✅ Immutable Blockchain Record</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainSuccessModal;