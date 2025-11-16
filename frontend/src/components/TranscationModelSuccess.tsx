import React from 'react';
import { Check, Copy, ExternalLink, X } from 'lucide-react';

interface TransactionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash: string;
  amount: string;
  recipient: string;
}

const TransactionSuccessModal: React.FC<TransactionSuccessModalProps> = ({
  isOpen,
  onClose,
  txHash,
  amount,
  recipient
}) => {
  if (!isOpen) return null;

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash);
  };

  const openCardanoScan = () => {
    window.open(`https://preview.cardanoscan.io/transaction/${txHash}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
            🎉 Transaction Successful!
          </h2>
          <p className="text-green-700 dark:text-green-300">
            Your ADA has been sent to the blockchain
          </p>
        </div>

        {/* Transaction Details */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Amount Sent</span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">₳{amount}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              To: {recipient.substring(0, 20)}...{recipient.substring(recipient.length - 10)}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Transaction Hash
              </span>
              <button
                onClick={copyTxHash}
                className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800/30 rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
            <div className="font-mono text-xs text-blue-800 dark:text-blue-200 break-all bg-white dark:bg-gray-800 p-3 rounded-lg">
              {txHash}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={openCardanoScan}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on CardanoScan</span>
          </button>
          
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Verification Badge */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm">
            <Check className="w-4 h-4" />
            <span>✅ Verified on Cardano Blockchain</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSuccessModal;