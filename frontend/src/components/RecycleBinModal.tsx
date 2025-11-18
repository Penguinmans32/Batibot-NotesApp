import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  CheckSquare, 
  Square,
  RefreshCw,
  Clock,
  FileText
} from 'lucide-react';
import { Note } from '../types/Note';
import ConfirmationModal from './ConfirmationModal';

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const RecycleBinModal: React.FC<RecycleBinModalProps> = ({ isOpen, onClose, onRefresh }) => {
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Confirmation modal states
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDeletedNotes();
    }
  }, [isOpen]);

  const fetchDeletedNotes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notes/recycle-bin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeletedNotes(data);
      }
    } catch (error) {
      console.error('Error fetching deleted notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleRestore = async (noteId: number) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notes/recycle-bin/${noteId}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchDeletedNotes();
        onRefresh(); // Refresh the main notes list
      }
    } catch (error) {
      console.error('Error restoring note:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (noteId: number) => {
    setNoteToDelete(noteId);
    setShowSingleDeleteConfirm(true);
  };

  const confirmSingleDelete = async () => {
    if (!noteToDelete) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notes/recycle-bin/${noteToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchDeletedNotes();
      }
    } catch (error) {
      console.error('Error permanently deleting note:', error);
    } finally {
      setActionLoading(false);
      setShowSingleDeleteConfirm(false);
      setNoteToDelete(null);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedNotes.length === 0) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notes/recycle-bin/bulk-restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedNotes })
      });

      if (response.ok) {
        setSelectedNotes([]);
        await fetchDeletedNotes();
        onRefresh();
      }
    } catch (error) {
      console.error('Error bulk restoring notes:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedNotes.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedNotes.length === 0) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notes/recycle-bin/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedNotes })
      });

      if (response.ok) {
        setSelectedNotes([]);
        await fetchDeletedNotes();
      }
    } catch (error) {
      console.error('Error bulk permanently deleting notes:', error);
    } finally {
      setActionLoading(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  const toggleNoteSelection = (noteId: number) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNotes.length === deletedNotes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(deletedNotes.map(note => note.id));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-background-card dark:bg-background-dark-card rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20 theme-transition my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary/20 dark:border-text-dark-secondary/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">Recycle Bin</h2>
              <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
                Notes are automatically deleted after 30 days
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchDeletedNotes}
              disabled={loading}
              className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-blue-400 hover:bg-secondary/10 dark:hover:bg-text-dark-secondary/10 rounded-lg transition-colors duration-200"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-blue-400 hover:bg-secondary/10 dark:hover:bg-text-dark-secondary/10 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls */}
        {deletedNotes.length > 0 && (
          <div className="p-6 border-b border-secondary/20 dark:border-text-dark-secondary/20 bg-background-light dark:bg-background-dark-lighter">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNotes.length === deletedNotes.length && deletedNotes.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-text-secondary dark:text-text-dark-secondary text-sm">Select All</span>
                </label>
                {selectedNotes.length > 0 && (
                  <span className="text-text-secondary dark:text-text-dark-secondary text-sm">
                    {selectedNotes.length} selected
                  </span>
                )}
              </div>
              
              {selectedNotes.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkRestore}
                    disabled={actionLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore ({selectedNotes.length})</span>
                  </button>
                  <button
                    onClick={handleBulkPermanentDelete}
                    disabled={actionLoading}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Forever ({selectedNotes.length})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh] scrollbar-hide">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-4 border-secondary/30 dark:border-text-dark-secondary/30 border-t-primary dark:border-t-blue-400 rounded-full animate-spin"></div>
                <span className="text-text-secondary dark:text-text-dark-secondary">Loading deleted notes...</span>
              </div>
            </div>
          ) : deletedNotes.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-16 h-16 text-text-secondary dark:text-text-dark-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-2">Recycle bin is empty</h3>
              <p className="text-text-secondary dark:text-text-dark-secondary">Deleted notes will appear here for 30 days before being permanently removed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deletedNotes.map((note) => {
                const daysRemaining = getDaysRemaining(note.deleted_at!);
                const isExpiringSoon = daysRemaining <= 7;
                
                return (
                  <div
                    key={note.id}
                    className={`bg-background-light dark:bg-background-dark-lighter rounded-2xl p-4 border transition-all duration-200 theme-transition ${
                      selectedNotes.includes(note.id)
                        ? 'border-primary dark:border-blue-400 bg-primary/5 dark:bg-blue-400/5'
                        : isExpiringSoon
                        ? 'border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-900/10'
                        : 'border-secondary/20 dark:border-text-dark-secondary/20'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <label className="flex-shrink-0 mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedNotes.includes(note.id)}
                          onChange={() => toggleNoteSelection(note.id)}
                          className="accent-primary w-4 h-4"
                        />
                      </label>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text-primary dark:text-text-dark-primary truncate mb-2">
                          {note.title}
                        </h4>
                        
                        <p className="text-text-secondary dark:text-text-dark-secondary text-sm line-clamp-2 mb-3">
                          {note.content.replace(/<[^>]*>/g, '')}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4 text-xs text-text-light dark:text-text-dark-light">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Deleted {new Date(note.deleted_at!).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`flex items-center justify-between p-2 rounded-lg ${
                          isExpiringSoon ? 'bg-red-100 dark:bg-red-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <Clock className={`w-4 h-4 ${isExpiringSoon ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                            <span className={`text-sm font-medium ${
                              isExpiringSoon ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'
                            }`}>
                              {daysRemaining === 0 
                                ? 'Expires today'
                                : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                              }
                            </span>
                          </div>
                          
                          {isExpiringSoon && (
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-3">
                          <button
                            onClick={() => handleRestore(note.id)}
                            disabled={actionLoading}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Restore</span>
                          </button>
                          
                          <button
                            onClick={() => handlePermanentDelete(note.id)}
                            disabled={actionLoading}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Forever</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Single Note Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSingleDeleteConfirm}
        onClose={() => {
          setShowSingleDeleteConfirm(false);
          setNoteToDelete(null);
        }}
        onConfirm={confirmSingleDelete}
        title="Delete Note Forever"
        message="Are you sure you want to permanently delete this note? This action cannot be undone."
        confirmText="Delete Forever"
        cancelText="Cancel"
        isDestructive={true}
        loading={actionLoading}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Notes Forever"
        message={`Are you sure you want to permanently delete ${selectedNotes.length} note${selectedNotes.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete Forever"
        cancelText="Cancel"
        isDestructive={true}
        loading={actionLoading}
      />

      <style>{`
        /* Hide scrollbar but keep functionality */
        .overflow-y-auto::-webkit-scrollbar,
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .overflow-y-auto,
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default RecycleBinModal;