import React, { useState } from 'react';
import { Shield, X, Lock, ExternalLink, Copy, Check } from 'lucide-react';

interface SecureNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSecureNote: (noteId: number, noteContent: string) => Promise<string>;
  notes: any[];
}

const SecureNoteModal: React.FC<SecureNoteModalProps> = ({
  isOpen,
  onClose,
  onSecureNote,
  notes
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isSecuring, setIsSecuring] = useState(false);
  const [securedTxHash, setSecuredTxHash] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSecureNote = async () => {
    if (!selectedNoteId) return;

    setIsSecuring(true);
    try {
      const selectedNote = notes.find(note => note.id === selectedNoteId);
      if (selectedNote) {
        const txHash = await onSecureNote(selectedNoteId, selectedNote.content);
        setSecuredTxHash(txHash);
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Failed to secure note:', error);
    } finally {
      setIsSecuring(false);
    }
  };

  const copyTxHash = () => {
    navigator.clipboard.writeText(securedTxHash);
  };

  const openCardanoScan = () => {
    window.open(`https://preview.cardanoscan.io/transaction/${securedTxHash}`, '_blank');
  };

  const resetModal = () => {
    setSelectedNoteId(null);
    setSecuredTxHash('');
    setIsSuccess(false);
    setIsSecuring(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
        {isSuccess ? (
          // Success State
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-2">
              🔒 Note Secured on Blockchain!
            </h2>
            <p className="text-purple-700 dark:text-purple-300 mb-6">
              Your note is now permanently secured on the Cardano blockchain
            </p>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                  Blockchain Proof Hash
                </span>
                <button
                  onClick={copyTxHash}
                  className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800/30 rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </button>
              </div>
              <div className="font-mono text-xs text-purple-800 dark:text-purple-200 break-all bg-white dark:bg-gray-800 p-3 rounded-lg">
                {securedTxHash}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={openCardanoScan}
                className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Proof</span>
              </button>
              
              <button
                onClick={handleClose}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-xl transition-all duration-300"
              >
                Done
              </button>
            </div>

            <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm">
              <Check className="w-4 h-4" />
              <span>✅ Immutable Blockchain Security</span>
            </div>
          </div>
        ) : (
          // Selection State
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Secure Note</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Lock your note on the blockchain</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select a note to secure on the blockchain:
              </label>
              
              {notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notes available to secure</p>
                  <p className="text-sm">Create a note first!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNoteId(note.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedNoteId === note.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {note.title || 'Untitled Note'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {note.content.substring(0, 100)}...
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Created: {new Date(note.created_at).toLocaleDateString()}
                    </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notes.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
                      Blockchain Security
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      Creates an immutable proof of your note's existence and content on the Cardano blockchain. 
                      Cost: ~0.5 ADA transaction fee.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {notes.length > 0 && (
              <button
                onClick={handleSecureNote}
                disabled={!selectedNoteId || isSecuring}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 dark:bg-purple-600 dark:hover:bg-purple-500 dark:disabled:bg-purple-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {isSecuring ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Secure on Blockchain</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureNoteModal;