import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteTitle: string;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  noteTitle, 
  loading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-background-dark-card rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-text-dark-secondary/20 theme-transition">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-text-dark-secondary/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 dark:from-red-600 dark:to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-text-dark-primary">
              Delete Note
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-background-dark-lighter rounded-xl transition-colors duration-200 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-text-dark-secondary" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Trash2 className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-dark-primary mb-2">
              Are you sure?
            </h3>
            <p className="text-gray-600 dark:text-text-dark-secondary text-sm">
              You're about to delete <span className="font-semibold text-gray-900 dark:text-text-dark-primary">"{noteTitle}"</span>. 
              This action cannot be undone.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 dark:bg-background-dark-lighter hover:bg-gray-200 dark:hover:bg-background-dark-light border border-gray-200 dark:border-text-dark-secondary/20 rounded-xl py-3 text-gray-700 dark:text-text-dark-secondary font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 rounded-xl py-3 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/25 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;