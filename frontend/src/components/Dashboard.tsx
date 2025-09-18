import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Plus, 
  Search, 
  FileText, 
  Edit3, 
  Trash2, 
  User,
  Sparkles,
  Star,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NoteModal from './NoteModal';
import DeleteConfirmModal from './DeleteConfirmModal'; // Add this import

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Add delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (noteData: { id?: number; title: string; content: string }) => {
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const isEditing = noteData.id;
      
      const response = await fetch(
        `http://localhost:5000/api/notes${isEditing ? `/${noteData.id}` : ''}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: noteData.title,
            content: noteData.content
          })
        }
      );

      if (response.ok) {
        const savedNote = await response.json();
        
        if (isEditing) {
          setNotes(notes.map(note => note.id === savedNote.id ? savedNote : note));
        } else {
          setNotes([savedNote, ...notes]);
        }
        
        setIsModalOpen(false);
      } else {
        console.error('Error saving note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setModalLoading(false);
    }
  };

  // Updated delete functions
  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notes/${noteToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteToDelete.id));
        setIsDeleteModalOpen(false);
        setNoteToDelete(null);
      } else {
        console.error('Error deleting note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setNoteToDelete(null);
  };

  const handleLogout = () => {
    logout();
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="bg-background-card rounded-3xl p-8 shadow-2xl border border-secondary/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-secondary/30 border-t-primary rounded-full animate-spin"></div>
            <span className="text-text-primary text-xl font-semibold">Loading your notes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background-light">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-background-card rounded-3xl p-6 shadow-2xl border border-secondary/20 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    Welcome back, {user?.name || 'User'}! 👋
                  </h1>
                  <p className="text-text-secondary">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-error/10 hover:bg-error/20 border border-error/30 rounded-xl px-4 py-2 text-error hover:text-white transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Search and Add Note */}
          <div className="bg-background-card rounded-3xl p-6 shadow-2xl border border-secondary/20 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background-light border border-secondary/20 rounded-xl pl-12 pr-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  placeholder="Search your notes..."
                />
              </div>
              <button 
                onClick={handleCreateNote}
                className="bg-primary hover:bg-primary-light rounded-xl px-6 py-3 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Note</span>
              </button>
            </div>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-background-card rounded-3xl p-12 shadow-2xl border border-secondary/20 text-center">
                  <FileText className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-text-primary mb-2">No notes yet</h3>
                  <p className="text-text-secondary mb-6">
                    {searchTerm ? 'No notes match your search.' : 'Start by creating your first note!'}
                  </p>
                  {!searchTerm && (
                    <button 
                      onClick={handleCreateNote}
                      className="bg-primary hover:bg-primary-light rounded-xl px-6 py-3 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Your First Note</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-background-card rounded-3xl p-6 shadow-2xl border border-secondary/20 hover:bg-secondary/5 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-text-primary truncate pr-2">
                      {note.title}
                    </h3>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => handleEditNote(note)}
                        className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-primary hover:text-primary-light transition-colors duration-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteNote(note)}
                        className="p-2 bg-error/10 hover:bg-error/20 rounded-lg text-error hover:text-white transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                    {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                    {note.content.length > 150 ? '...' : ''}
                  </p>
                  
                  <div className="flex items-center text-text-light text-xs">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(note.created_at).toLocaleDateString()}
                    {note.updated_at !== note.created_at && (
                      <span className="ml-2">• Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
        loading={modalLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDeleteNote}
        noteTitle={noteToDelete?.title || ''}
        loading={deleteLoading}
      />
    </>
  );
};

export default Dashboard;