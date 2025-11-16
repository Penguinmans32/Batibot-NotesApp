import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Plus, 
  Search, 
  FileText, 
  Edit3, 
  Trash2, 
  User,
  Calendar,
  CheckSquare,
  Square,
  Flag,
  Filter,
  SortAsc,
  ListTodo,
  Clock,
  AlertTriangle,
  Heart,
  Archive,
  MousePointer2,
  X,
  Wallet,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import NoteModal from './NoteModal';
import ViewNoteModal from './ViewNoteModal';
import TodoModal from './TodoModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import RecycleBinModal from './RecycleBinModal';
import { Todo, FilterType, SortType } from '../types/Todo';
import { Note, NoteTag } from '../types/Note';
import { toggleNoteFavorite } from '../utils/api';
import CardanoWallet from './CardanoWallet';
import { useCardanoContext } from '../contexts/CardanoContext';
import BlockchainSuccessModal from './BlockchainSuccessModal';
import BlockchainAmountModal from './BlockchainAmountModal';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  // Selection mode functions
  const enterSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedNotes([]);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedNotes([]);
  };

  const toggleNoteSelection = (noteId: number) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const selectAllFilteredNotes = () => {
    const allIds = filteredNotes.map(note => note.id);
    setSelectedNotes(allIds);
  };

  const deselectAllNotes = () => {
    setSelectedNotes([]);
  };
  const handleBulkDeleteNotes = () => {
    if (selectedNotes.length === 0) return;
    setPendingBulkDelete(true);
  };

  const confirmBulkDeleteNotes = async () => {
    if (selectedNotes.length === 0) return;
    setDeleteLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // 1. BULK DELETE FROM DATABASE FIRST
      const response = await fetch('http://localhost:5000/api/notes/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedNotes })
      });
      
      if (response.ok) {
        // 2. 🔥 SHOW ADA AMOUNT MODAL FOR BULK DELETE
        if (wallet) {
          const deletedNotes = notes.filter(note => selectedNotes.includes(note.id));
          setPendingBlockchainAction({
            type: 'note',
            action: 'delete',
            data: { title: `${selectedNotes.length} notes bulk deleted`, notes: deletedNotes },
            callback: async (amount: string) => {
              try {
                console.log(`🔗 Creating blockchain records for bulk delete of ${selectedNotes.length} notes with ${amount} ADA...`);
                
                const blockchainPromises = deletedNotes.map(note => 
                  createNoteWithMetadata(note.id, `DELETE:${note.title}`, amount)
                );
                
                const txHashes = await Promise.all(blockchainPromises);
                
                console.log('✅ Bulk blockchain DELETE completed:', txHashes);
                
                // Show success modal for first transaction
                if (txHashes.length > 0) {
                  setBlockchainSuccessData({
                    txHash: txHashes[0],
                    action: 'deleted',
                    title: `${selectedNotes.length} notes bulk deleted`,
                    itemType: 'Note'
                  });
                  setIsBlockchainSuccessModalOpen(true);
                }
                setIsAmountModalOpen(false);
                setPendingBlockchainAction(null);
              } catch (blockchainError: any) {
                console.error('Bulk blockchain transaction failed:', blockchainError);
                alert(
                  `✅ ${selectedNotes.length} notes deleted from database!\n\n` +
                  `⚠️ Blockchain transactions failed: ${blockchainError?.message || 'Unknown error'}\n\n` +
                  `💡 Notes are deleted, but deletions not recorded on blockchain.`
                );
                setIsAmountModalOpen(false);
                setPendingBlockchainAction(null);
              }
            }
          });
          setIsAmountModalOpen(true);
        } else {
          // No wallet connected
          alert(`✅ ${selectedNotes.length} notes deleted successfully!\n\n💡 Connect Cardano wallet for blockchain audit trail!`);
        }

        // 3. UPDATE UI STATE
        setNotes(notes.filter(note => !selectedNotes.includes(note.id)));
        setSelectedNotes([]);
        setIsSelectionMode(false);
      }
    } catch (error) {
      console.error('Error bulk deleting notes:', error);
      alert('❌ Failed to delete notes. Please try again.');
    } finally {
      setDeleteLoading(false);
      setPendingBulkDelete(false);
    }
  };

  const { user, logout } = useAuth();
  const { wallet, createNoteWithMetadata } = useCardanoContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'todos' | 'cardano'>('notes');
  // Multi-select state for notes
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [isBlockchainSuccessModalOpen, setIsBlockchainSuccessModalOpen] = useState(false);
  const [blockchainSuccessData, setBlockchainSuccessData] = useState({
    txHash: '',
    action: '',
    title: '',
    itemType: 'Note' as 'Note' | 'Todo'
  });


  // Note filtering states
  const [noteDateFilter, setNoteDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'specific'>('all');
  const [specificDate, setSpecificDate] = useState<string>('');
  const [noteSortOrder, setNoteSortOrder] = useState<'title-asc' | 'title-desc' | 'recent' | 'oldest'>('recent');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [pendingBlockchainAction, setPendingBlockchainAction] = useState<{
    type: 'note' | 'todo';
    action: string;
    data: any;
    callback: (amount: string) => Promise<void>;
  } | null>(null);

  // Note states
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteModalLoading, setNoteModalLoading] = useState(false);
  const navigate = useNavigate();

  // View Note Modal states
  const [isViewNoteModalOpen, setIsViewNoteModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  // Todo states
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [todoModalLoading, setTodoModalLoading] = useState(false);
  const [todoFilter, setTodoFilter] = useState<FilterType>('all');
  const [todoSort, setTodoSort] = useState<SortType>('due_date');

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<(Note | Todo) & { type: 'note' | 'todo' } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Recycle bin modal state
  const [isRecycleBinModalOpen, setIsRecycleBinModalOpen] = useState(false);

  useEffect(() => {
    fetchNotes();
    fetchTodos();
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

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // Note functions
  const handleCreateNote = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const handleToggleFavorite = async (noteId: number) => {
    try {
      const updated = await toggleNoteFavorite(noteId);
      setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
    setIsViewNoteModalOpen(true);
  };

  const handleEditFromView = () => {
    if (viewingNote) {
      setIsViewNoteModalOpen(false);
      setEditingNote(viewingNote);
      setIsNoteModalOpen(true);
    }
  };

  const handleSaveNote = async (noteData: { id?: number; title: string; content: string; tags?: NoteTag[] }) => {
    setNoteModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const isEditing = noteData.id;

      // 1. SAVE TO DATABASE FIRST
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
            content: noteData.content,
            tags: noteData.tags || []
          })
        }
      );

      if (response.ok) {
        const savedNote = await response.json();

        // 2. 🔥 SHOW ADA AMOUNT MODAL IF WALLET CONNECTED
        if (wallet) {
          const action = isEditing ? 'updated' : 'created';
          setPendingBlockchainAction({
            type: 'note',
            action: isEditing ? 'update' : 'create',
            data: savedNote,
            callback: async (amount: string) => {
              try {
                console.log(`🔗 Creating blockchain record for ${isEditing ? 'UPDATE' : 'CREATE'}: ${savedNote.title} with ${amount} ADA`);
                
                const txHash = await createNoteWithMetadata(
                  savedNote.id,
                  `${isEditing ? 'UPDATE' : 'CREATE'}:${savedNote.title}`,
                  amount // Pass custom amount
                );
                
                console.log(`✅ Blockchain ${isEditing ? 'UPDATE' : 'CREATE'} completed:`, txHash);
                
                // Show success modal
                setBlockchainSuccessData({
                  txHash,
                  action: action,
                  title: savedNote.title,
                  itemType: 'Note'
                });
                setIsBlockchainSuccessModalOpen(true);
                setIsAmountModalOpen(false);
                setPendingBlockchainAction(null);
              } catch (blockchainError: any) {
                console.error('Blockchain transaction failed:', blockchainError);
                alert(
                  `✅ Note ${action} in database!\n\n` +
                  `⚠️ Blockchain transaction failed: ${blockchainError?.message || 'Unknown error'}\n\n` +
                  `💡 Your note is saved, but not secured on blockchain.`
                );
                setIsAmountModalOpen(false);
                setPendingBlockchainAction(null);
              }
            }
          });
          setIsAmountModalOpen(true);
        } else {
          // No wallet connected - show regular success
          alert(`✅ Note ${isEditing ? 'updated' : 'created'} successfully!\n\n💡 Connect Cardano wallet for blockchain security!`);
        }

        // 3. UPDATE UI STATE
        if (isEditing) {
          setNotes(notes.map(note => note.id === savedNote.id ? savedNote : note));
        } else {
          setNotes([savedNote, ...notes]);
        }

        setIsNoteModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('❌ Failed to save note. Please try again.');
    } finally {
      setNoteModalLoading(false);
    }
  };

  // Todo functions
  const handleCreateTodo = () => {
    setEditingTodo(null);
    setIsTodoModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsTodoModalOpen(true);
  };

  const handleSaveTodo = async (todoData: Partial<Todo>) => {
    setTodoModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const isEditing = todoData.id;

      // 1. SAVE TO DATABASE FIRST
      const response = await fetch(
        `http://localhost:5000/api/todos${isEditing ? `/${todoData.id}` : ''}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(todoData)
        }
      );

      if (response.ok) {
        const savedTodo = await response.json();

        // 2. 🔥 SHOW ADA AMOUNT MODAL IF WALLET CONNECTED
        if (wallet) {
          const action = isEditing ? 'updated' : 'created';
          setPendingBlockchainAction({
            type: 'todo',
            action: isEditing ? 'update' : 'create',
            data: savedTodo,
            callback: async (amount: string) => {
              try {
                console.log(`🔗 Creating blockchain record for TODO ${isEditing ? 'UPDATE' : 'CREATE'}: ${savedTodo.title} with ${amount} ADA`);
                
                const txHash = await createNoteWithMetadata(
                  savedTodo.id,
                  `TODO_${isEditing ? 'UPDATE' : 'CREATE'}:${savedTodo.title}`,
                  amount,
                );
                
                console.log(`✅ Blockchain TODO ${isEditing ? 'UPDATE' : 'CREATE'} completed:`, txHash);
                
                // Show success modal
                setBlockchainSuccessData({
                  txHash,
                  action: action,
                  title: savedTodo.title,
                  itemType: 'Todo'
                });
                setIsBlockchainSuccessModalOpen(true);
                setIsAmountModalOpen(false);
                setPendingBlockchainAction(null);
              } catch (blockchainError: any) {
                console.error('Blockchain transaction failed:', blockchainError);
                alert(
                  `✅ Todo ${action} in database!\n\n` +
                  `⚠️ Blockchain transaction failed: ${blockchainError?.message || 'Unknown error'}\n\n` +
                  `💡 Your todo is saved, but not secured on blockchain.`
                );
                setIsAmountModalOpen(false);
                setPendingBlockchainAction(null);
              }
            }
          });
          setIsAmountModalOpen(true);
        } else {
          // No wallet connected - show regular success
          alert(`✅ Todo ${isEditing ? 'updated' : 'created'} successfully!\n\n💡 Connect Cardano wallet for blockchain security!`);
        }

        // 3. UPDATE UI STATE
        if (isEditing) {
          setTodos(todos.map(todo => todo.id === savedTodo.id ? savedTodo : todo));
        } else {
          setTodos([savedTodo, ...todos]);
        }

        setIsTodoModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving todo:', error);
      alert('❌ Failed to save todo. Please try again.');
    } finally {
      setTodoModalLoading(false);
    }
  };

  const handleToggleTodo = async (todoId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. TOGGLE IN DATABASE FIRST
      const response = await fetch(`http://localhost:5000/api/todos/${todoId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedTodo = await response.json();

        // 2. 🔥 SHOW ADA AMOUNT MODAL IF WALLET CONNECTED
        if (wallet) {
          const action = updatedTodo.completed ? 'completed' : 'reopened';
          setPendingBlockchainAction({
            type: 'todo',
            action: action,
            data: updatedTodo,
            callback: async (amount: string) => {
              try {
                console.log(`🔗 Creating blockchain record for TODO ${action}: ${updatedTodo.title} with ${amount} ADA`);
                
                const txHash = await createNoteWithMetadata(
                  updatedTodo.id,
                  `TODO_${action.toUpperCase()}:${updatedTodo.title}`,
                  amount // Pass custom amount
                );
                
                console.log(`✅ Blockchain TODO ${action} completed:`, txHash);
                
                // Show success modal
                setBlockchainSuccessData({
                  txHash,
                  action: action,
                  title: updatedTodo.title,
                  itemType: 'Todo'
                });
                setIsBlockchainSuccessModalOpen(true);
                setIsAmountModalOpen(false);
                setPendingBlockchainAction(null);
              } catch (blockchainError: any) {
                console.error('Blockchain transaction failed:', blockchainError);
                setIsAmountModalOpen(false);
                setPendingBlockchainAction(null);
              }
            }
          });
          setIsAmountModalOpen(true);
        }

        // 3. UPDATE UI STATE
        setTodos(todos.map(todo => todo.id === todoId ? updatedTodo : todo));
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  // Delete functions
  const handleDeleteItem = (item: Note | Todo, type: 'note' | 'todo') => {
    setItemToDelete({ ...item, type });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = itemToDelete.type === 'note' ? 'notes' : 'todos';
      
      // 1. DELETE FROM DATABASE FIRST
      const response = await fetch(`http://localhost:5000/api/${endpoint}/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // 2. 🔥 SHOW ADA AMOUNT MODAL FOR DELETION
        if (wallet) {
          setPendingBlockchainAction({
            type: itemToDelete.type,
            action: 'delete',
            data: itemToDelete,
            callback: async (amount: string) => {
              try {
                const itemType = itemToDelete.type === 'note' ? 'NOTE' : 'TODO';
                console.log(`🔗 Creating blockchain record for ${itemType} DELETE: ${itemToDelete.title} with ${amount} ADA`);
                
                const txHash = await createNoteWithMetadata(
                  itemToDelete.id,
                  `DELETE:${itemToDelete.title}`,
                  amount // Pass custom amount
                );
                
                console.log(`✅ Blockchain ${itemType} DELETE completed:`, txHash);
                
                // Show success modal
                setBlockchainSuccessData({
                  txHash,
                  action: 'deleted',
                  title: itemToDelete.title,
                  itemType: itemToDelete.type === 'note' ? 'Note' : 'Todo'
                });
                setIsBlockchainSuccessModalOpen(true);
                setIsAmountModalOpen(false);
                setPendingBlockchainAction(null);
              } catch (blockchainError: any) {
                console.error('Blockchain transaction failed:', blockchainError);
                alert(
                  `✅ ${itemToDelete.type === 'note' ? 'Note' : 'Todo'} deleted from database!\n\n` +
                  `⚠️ Blockchain transaction failed: ${blockchainError?.message || 'Unknown error'}\n\n` +
                  `💡 Item is deleted, but deletion not recorded on blockchain.`
                );
                setIsAmountModalOpen(false);
                setPendingBlockchainAction(null);
              }
            }
          });
          setIsAmountModalOpen(true);
        } else {
          // No wallet connected
          alert(`✅ ${itemToDelete.type === 'note' ? 'Note' : 'Todo'} deleted successfully!\n\n💡 Connect Cardano wallet for blockchain audit trail!`);
        }

        // 3. UPDATE UI STATE
        if (itemToDelete.type === 'note') {
          setNotes(notes.filter(note => note.id !== itemToDelete.id));
        } else {
          setTodos(todos.filter(todo => todo.id !== itemToDelete.id));
        }
        
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('❌ Failed to delete item. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Filter and sort todos
  const getFilteredAndSortedTodos = () => {
    let filtered = todos.filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      switch (todoFilter) {
        case 'active':
          return !todo.completed;
        case 'completed':
          return todo.completed;
        case 'overdue':
          return !todo.completed && todo.due_date && new Date(todo.due_date) < new Date();
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      switch (todoSort) {
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          const priorityOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  const getFilteredAndSortedNotes = () => {
    let filtered = notes.filter(note => {
      // Search filter
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Tag filter
      if (selectedTagFilter !== 'all') {
        const hasTag = note.tags?.some(tag => tag.name === selectedTagFilter);
        if (!hasTag) return false;
      }

      // Date filter
      if (noteDateFilter !== 'all') {
        const noteDate = new Date(note.created_at);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (noteDateFilter) {
          case 'today':
            const todayEnd = new Date(today);
            todayEnd.setDate(todayEnd.getDate() + 1);
            if (noteDate < today || noteDate >= todayEnd) return false;
            break;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (noteDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            if (noteDate < monthAgo) return false;
            break;
          case 'specific':
            if (specificDate) {
              const selectedDate = new Date(specificDate);
              const selectedDateStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
              const selectedDateEnd = new Date(selectedDateStart);
              selectedDateEnd.setDate(selectedDateEnd.getDate() + 1);
              if (noteDate < selectedDateStart || noteDate >= selectedDateEnd) return false;
            }
            break;
        }
      }

      return true;
    });

    // Sort notes
    return filtered.sort((a, b) => {
      switch (noteSortOrder) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });
  };

  const filteredNotes = getFilteredAndSortedNotes();
  const favoriteNotes = filteredNotes.filter(n => n.favorite);
  const otherNotes = filteredNotes.filter(n => !n.favorite);

  const filteredTodos = getFilteredAndSortedTodos();

  // Todo statistics
  const todoStats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    overdue: todos.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark-light flex items-center justify-center theme-transition">
        <div className="bg-background-card dark:bg-background-dark-card rounded-3xl p-8 shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-secondary/30 dark:border-text-dark-secondary/30 border-t-primary dark:border-t-blue-400 rounded-full animate-spin"></div>
            <span className="text-text-primary dark:text-text-dark-primary text-xl font-semibold">Loading your workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background-light dark:bg-background-dark-light theme-transition">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-background-card dark:bg-background-dark-card rounded-3xl p-6 shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20 mb-8 theme-transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary dark:bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
                    Welcome back, {user?.name || 'User'}! 👋
                  </h1>
                  <p className="text-text-secondary dark:text-text-dark-secondary">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-error/10 hover:bg-error/20 dark:bg-red-900/20 dark:hover:bg-red-900/30 border border-error/30 dark:border-red-500/30 rounded-xl px-4 py-2 text-error dark:text-red-400 hover:text-white transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-background-card dark:bg-background-dark-card rounded-3xl p-6 shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20 mb-8 theme-transition">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'notes'
                    ? 'bg-primary dark:bg-blue-600 text-white shadow-lg'
                    : 'bg-secondary/10 dark:bg-text-dark-secondary/10 text-text-secondary dark:text-text-dark-secondary hover:bg-secondary/20 dark:hover:bg-text-dark-secondary/20'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Notes</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{notes.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('todos')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'todos'
                    ? 'bg-primary dark:bg-blue-600 text-white shadow-lg'
                    : 'bg-secondary/10 dark:bg-text-dark-secondary/10 text-text-secondary dark:text-text-dark-secondary hover:bg-secondary/20 dark:hover:bg-text-dark-secondary/20'
                }`}
              >
                <ListTodo className="w-5 h-5" />
                <span>Todos</span>
                <span className="bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full text-xs">{todoStats.total}</span>
              </button>
              <button
                onClick={() => setActiveTab('cardano')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'cardano'
                    ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-lg'
                    : 'bg-secondary/10 dark:bg-text-dark-secondary/10 text-text-secondary dark:text-text-dark-secondary hover:bg-secondary/20 dark:hover:bg-text-dark-secondary/20'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span>Cardano</span>
              </button>
            </div>

            {/* Todo Statistics */}
            {activeTab === 'todos' && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 theme-transition">
                  <div className="flex items-center space-x-2">
                    <ListTodo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-800 dark:text-blue-300 font-semibold">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{todoStats.total}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl p-4 theme-transition">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-800 dark:text-green-300 font-semibold">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-200">{todoStats.completed}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4 theme-transition">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-red-800 dark:text-red-300 font-semibold">Overdue</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-200">{todoStats.overdue}</p>
                </div>
              </div>
            )}

            {/* Search and Controls */}
            <div className="space-y-4">
              {/* First Row: Search and Primary Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-dark-secondary w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-background-light dark:bg-background-dark-lighter border border-secondary/20 dark:border-text-dark-secondary/20 rounded-xl pl-12 pr-4 py-3 text-text-primary dark:text-text-dark-primary placeholder-text-secondary dark:placeholder-text-dark-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    placeholder={`Search your ${activeTab}...`}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={activeTab === 'notes' ? handleCreateNote : handleCreateTodo}
                    className="bg-primary hover:bg-primary-light rounded-xl px-6 py-3 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New {activeTab === 'notes' ? 'Note' : 'Todo'}</span>
                  </button>

                  {/* Selection Mode Toggle - Only show for notes */}
                  {activeTab === 'notes' && (
                    <button
                      onClick={isSelectionMode ? exitSelectionMode : enterSelectionMode}
                      className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap ${
                        isSelectionMode
                          ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg'
                          : 'bg-secondary/10 dark:bg-text-dark-secondary/10 hover:bg-secondary/20 dark:hover:bg-text-dark-secondary/20 border border-secondary/30 dark:border-border-dark-primary text-text-primary dark:text-text-dark-primary'
                      }`}
                    >
                      {isSelectionMode ? (
                        <>
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </>
                      ) : (
                        <>
                          <MousePointer2 className="w-4 h-4" />
                          <span>Select</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Recycle Bin Button - Only show for notes */}
                  {activeTab === 'notes' && (
                    <button
                      onClick={() => setIsRecycleBinModalOpen(true)}
                      className="bg-red-500/15 hover:bg-red-500/25 dark:bg-red-600/20 dark:hover:bg-red-500/30 border border-red-400/40 dark:border-red-400/50 rounded-xl px-4 py-3 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 font-semibold transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap hover:scale-105 transform"
                      title="Recycle Bin"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Bin</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Second Row: Filters and Sorting - Only show when relevant */}
              {(activeTab === 'notes' || activeTab === 'todos') && (
                <div className="flex flex-wrap justify-center gap-4">
                  {/* Note Filters and Sort */}
                  {activeTab === 'notes' && (
                    <>
                      <div className="flex items-center space-x-2 min-w-0">
                        <Calendar className="w-5 h-5 text-text-secondary dark:text-text-dark-secondary flex-shrink-0" />
                        <select
                          value={noteDateFilter}
                          onChange={(e) => setNoteDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month' | 'specific')}
                          className="bg-background-light dark:bg-background-dark-card border border-secondary/20 dark:border-border-dark-primary rounded-xl px-2 py-3 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent transition-all duration-300"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">This Week</option>
                          <option value="month">This Month</option>
                          <option value="specific">Specific Date</option>
                        </select>
                      </div>
                      
                      {noteDateFilter === 'specific' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="date"
                            value={specificDate}
                            onChange={(e) => setSpecificDate(e.target.value)}
                            className="bg-background-light dark:bg-background-dark-card border border-secondary/20 dark:border-border-dark-primary rounded-xl px-4 py-3 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent transition-all duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 min-w-0">
                        <Flag className="w-5 h-5 text-text-secondary dark:text-text-dark-secondary flex-shrink-0" />
                        <select
                          value={selectedTagFilter}
                          onChange={(e) => setSelectedTagFilter(e.target.value)}
                          className="bg-background-light dark:bg-background-dark-card border border-secondary/20 dark:border-border-dark-primary rounded-xl px-2 py-3 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent transition-all duration-300"
                        >
                          <option value="all">All Tags</option>
                          {Array.from(new Set(notes.flatMap(note => note.tags?.map(tag => tag.name) || []))).map(tagName => (
                            <option key={tagName} value={tagName}>{tagName}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2 min-w-0">
                        <SortAsc className="w-5 h-5 text-text-secondary dark:text-text-dark-secondary flex-shrink-0" />
                        <select
                          value={noteSortOrder}
                          onChange={(e) => setNoteSortOrder(e.target.value as 'title-asc' | 'title-desc' | 'recent' | 'oldest')}
                          className="bg-background-light dark:bg-background-dark-card border border-secondary/20 dark:border-border-dark-primary rounded-xl px-2 py-3 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent transition-all duration-300"
                        >
                          <option value="recent">Recently Added</option>
                          <option value="oldest">Oldest First</option>
                          <option value="title-asc">Title A-Z</option>
                          <option value="title-desc">Title Z-A</option>
                        </select>
                      </div>
                      
                      {(noteDateFilter !== 'all' || noteSortOrder !== 'recent' || searchTerm || selectedTagFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setNoteDateFilter('all');
                            setSpecificDate('');
                            setNoteSortOrder('recent');
                            setSearchTerm('');
                            setSelectedTagFilter('all');
                          }}
                          className="px-4 py-3 text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary bg-background-light dark:bg-background-dark-card hover:bg-background-lighter dark:hover:bg-background-dark-lighter border border-secondary/20 dark:border-border-dark-primary rounded-xl transition-all duration-300 flex items-center space-x-2 whitespace-nowrap"
                          title="Clear all filters"
                        >
                          <Filter className="w-4 h-4" />
                          <span className="text-sm">Clear</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Todo Filters and Sort */}
                  {activeTab === 'todos' && (
                    <>
                      <select
                        value={todoFilter}
                        onChange={(e) => setTodoFilter(e.target.value as FilterType)}
                        className="bg-background-light dark:bg-background-dark-card border border-secondary/20 dark:border-border-dark-primary rounded-xl px-4 py-3 pr-10 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent transition-all duration-300"
                      >
                        <option value="all">All Todos</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <select
                        value={todoSort}
                        onChange={(e) => setTodoSort(e.target.value as SortType)}
                        className="bg-background-light dark:bg-background-dark-card border border-secondary/20 dark:border-border-dark-primary rounded-xl px-4 py-3 pr-10 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:border-transparent transition-all duration-300"
                      >
                        <option value="due_date">Due Date</option>
                        <option value="priority">Priority</option>
                        <option value="created_at">Created</option>
                      </select>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selection Controls Bar - Only show for notes in selection mode */}
          {activeTab === 'notes' && isSelectionMode && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-500/30 rounded-3xl p-4 shadow-lg mb-8 theme-transition animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-800 dark:text-blue-300 font-semibold">
                      Selection Mode
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300">
                      {selectedNotes.length} selected
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {selectedNotes.length < filteredNotes.length && filteredNotes.length > 0 && (
                    <button
                      onClick={selectAllFilteredNotes}
                      className="bg-blue-100 dark:bg-blue-800/30 hover:bg-blue-200 dark:hover:bg-blue-700/40 border border-blue-300 dark:border-blue-600/50 rounded-xl px-4 py-2 text-blue-800 dark:text-blue-300 font-semibold transition-all duration-300 flex items-center space-x-2 hover:scale-105 transform"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Select All ({filteredNotes.length})</span>
                    </button>
                  )}
                  
                  {selectedNotes.length > 0 && (
                    <>
                      <button
                        onClick={deselectAllNotes}
                        className="bg-gray-100 dark:bg-gray-700/30 hover:bg-gray-200 dark:hover:bg-gray-600/40 border border-gray-300 dark:border-gray-600/50 rounded-xl px-4 py-2 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 flex items-center space-x-2 hover:scale-105 transform"
                      >
                        <Square className="w-4 h-4" />
                        <span>Deselect All</span>
                      </button>
                      
                      <button
                        onClick={handleBulkDeleteNotes}
                        className="bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 border border-red-300 dark:border-red-600/50 rounded-xl px-4 py-2 text-red-800 dark:text-red-400 hover:text-white dark:hover:text-white font-semibold transition-all duration-300 flex items-center space-x-2 hover:bg-red-500 dark:hover:bg-red-600 hover:scale-105 transform"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete ({selectedNotes.length})</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Filter Results Indicator for Notes */}
          {activeTab === 'notes' && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-text-secondary">
                <FileText className="w-4 h-4" />
                <span className="text-sm">
                  Showing {filteredNotes.length} of {notes.length} notes
                  {(noteDateFilter !== 'all' || noteSortOrder !== 'recent' || searchTerm) && (
                    <span className="text-primary"> • Filtered</span>
                  )}
                </span>
              </div>
              {filteredNotes.length > 0 && (
                <div className="text-xs text-text-light">
                  Sorted by: {
                    noteSortOrder === 'recent' ? 'Recently Added' :
                    noteSortOrder === 'oldest' ? 'Oldest First' :
                    noteSortOrder === 'title-asc' ? 'Title A-Z' :
                    'Title Z-A'
                  }
                </div>
              )}
            </div>
          )}

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'notes' ? (
              filteredNotes.length === 0 ? (
                <div className="col-span-full">
                  <div className="bg-background-card dark:bg-background-dark-card rounded-3xl p-12 shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20 text-center theme-transition">
                    <FileText className="w-16 h-16 text-text-secondary dark:text-text-dark-secondary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">No notes yet</h3>
                    <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
                      {noteDateFilter === 'specific' && specificDate
                        ? 'No existing notes on this day.'
                        : searchTerm
                        ? 'No notes match your search.'
                        : 'Start by creating your first note!'}
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
                <>
                  {/* Favorites Section */}
                  {favoriteNotes.length > 0 && (
                    <>
                      <div className="col-span-full flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                          <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">Favorites</h3>
                          <span className="text-xs text-text-secondary dark:text-text-dark-secondary">{favoriteNotes.length}</span>
                        </div>
                      </div>
                      {favoriteNotes.map((note) => (
                        <div
                          key={`fav-${note.id}`}
                          className={`bg-background-card dark:bg-background-dark-card rounded-3xl p-6 shadow-2xl border border-pink-300 dark:border-pink-500/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl group cursor-pointer theme-transition relative ${
                            isSelectionMode
                              ? selectedNotes.includes(note.id)
                                ? 'ring-4 ring-blue-500 dark:ring-blue-400 ring-opacity-50 bg-blue-50/50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500'
                                : 'hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-500 hover:ring-opacity-30'
                              : 'hover:bg-secondary/5 dark:hover:bg-text-dark-secondary/5'
                          }`}
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                          onClick={() => isSelectionMode ? toggleNoteSelection(note.id) : handleViewNote(note)}
                        >
                          {/* Selection Indicator */}
                          {isSelectionMode && (
                            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              selectedNotes.includes(note.id)
                                ? 'bg-blue-500 border-blue-500 text-white'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                            }`}>
                              {selectedNotes.includes(note.id) && (
                                <CheckSquare className="w-4 h-4" />
                              )}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="text-xl font-bold text-text-primary dark:text-text-dark-primary truncate pr-2">
                                {note.title}
                              </h3>
                              {!isSelectionMode && (
                                <div className="flex space-x-2 opacity-100 transition-opacity duration-300">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditNote(note);
                                    }}
                                    className="p-2 rounded-lg text-text-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-primary-light hover:bg-secondary/10 dark:hover:bg-text-dark-secondary/10 transition-colors duration-200"
                                    title="Edit Note"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleFavorite(note.id);
                                    }}
                                    className="p-2 rounded-lg text-pink-500 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-400/10 transition-colors duration-200"
                                    title="Unfavorite"
                                  >
                                    <Heart className="w-4 h-4" fill="currentColor" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteItem(note, 'note');
                                    }}
                                    className="p-2 bg-error/10 dark:bg-red-500/10 hover:bg-error/20 dark:hover:bg-red-500/20 rounded-lg text-error dark:text-red-400 hover:text-white dark:hover:text-white transition-colors duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <p className="text-text-secondary dark:text-text-dark-secondary text-sm mb-4 line-clamp-3">
                              <span style={{ whiteSpace: 'pre-line', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                {note.content.replace(/<[^>]*>/g, '')}
                              </span>
                            </p>

                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {note.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    style={{ backgroundColor: tag.color, color: '#fff' }}
                                    className="px-2 py-1 rounded-full text-xs font-semibold"
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center text-text-light dark:text-text-dark-tertiary text-xs">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(note.created_at).toLocaleDateString()}
                              {note.updated_at !== note.created_at && (
                                <span className="ml-2">• Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Divider */}
                      <div className="col-span-full h-px bg-secondary/20 dark:bg-border-dark-primary/30" />
                    </>
                  )}

                  {/* Bulk select controls */}
                  <div className="col-span-full flex items-center justify-between">
                    <div className="flex items-center">
                      {isSelectionMode && (
                        <div className="text-sm text-text-secondary dark:text-text-dark-secondary">
                          Click notes to select them for bulk actions
                        </div>
                      )}
                    </div>
                  </div>

                  {otherNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`bg-background-card dark:bg-background-dark-card rounded-3xl p-6 shadow-2xl border transition-all duration-700 ease-in-out transform hover:scale-[1.02] hover:shadow-xl group cursor-pointer theme-transition relative ${
                        isSelectionMode
                          ? selectedNotes.includes(note.id)
                            ? 'ring-4 ring-blue-500 dark:ring-blue-400 ring-opacity-50 bg-blue-50/50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500'
                            : 'hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-500 hover:ring-opacity-30 border-primary/30 dark:border-primary-dark/30'
                          : 'border-primary/30 dark:border-primary-dark/30 hover:bg-secondary/5 dark:hover:bg-text-dark-secondary/5'
                      }`}
                      style={{ 
                        wordBreak: 'break-word', 
                        overflowWrap: 'break-word', 
                        border: isSelectionMode && selectedNotes.includes(note.id) ? undefined : '2px solid #3B82F6' 
                      }}
                      onClick={() => isSelectionMode ? toggleNoteSelection(note.id) : handleViewNote(note)}
                    >
                      {/* Selection Indicator */}
                      {isSelectionMode && (
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${
                          selectedNotes.includes(note.id)
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        }`}>
                          {selectedNotes.includes(note.id) && (
                            <CheckSquare className="w-4 h-4" />
                          )}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-text-primary dark:text-text-dark-primary truncate pr-2">
                            {note.title}
                          </h3>
                          {!isSelectionMode && (
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditNote(note);
                                }}
                                className="p-2 rounded-lg text-text-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-primary-light hover:bg-secondary/10 dark:hover:bg-text-dark-secondary/10 transition-colors duration-200"
                                title="Edit Note"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(note.id);
                                }}
                                className={`p-2 rounded-lg transition-colors duration-200 ${note.favorite ? 'text-pink-500 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-400/10' : 'text-text-secondary dark:text-text-dark-secondary hover:text-pink-500 dark:hover:text-pink-400 hover:bg-secondary/10 dark:hover:bg-text-dark-secondary/10'}`}
                                title={note.favorite ? 'Unfavorite' : 'Favorite'}
                              >
                                <Heart className="w-4 h-4" fill={note.favorite ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(note, 'note');
                                }}
                                className="p-2 bg-error/10 dark:bg-red-500/10 hover:bg-error/20 dark:hover:bg-red-500/20 rounded-lg text-error dark:text-red-400 hover:text-white dark:hover:text-white transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-text-secondary dark:text-text-dark-secondary text-sm mb-4 line-clamp-3">
                          <span style={{ whiteSpace: 'pre-line', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {note.content.replace(/<[^>]*>/g, '')}
                          </span>
                        </p>

                        {/* Tags Display */}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {note.tags.map((tag, index) => (
                              <span
                                key={index}
                                style={{ backgroundColor: tag.color, color: '#fff' }}
                                className="px-2 py-1 rounded-full text-xs font-semibold"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center text-text-light dark:text-text-dark-tertiary text-xs">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(note.created_at).toLocaleDateString()}
                          {note.updated_at !== note.created_at && (
                            <span className="ml-2">• Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )
            ) : activeTab === 'todos' ? (
              filteredTodos.length === 0 ? (
                <div className="col-span-full">
                  <div className="bg-background-card dark:bg-background-dark-card rounded-3xl p-12 shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20 text-center theme-transition">
                    <ListTodo className="w-16 h-16 text-text-secondary dark:text-text-dark-secondary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">No todos yet</h3>
                    <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
                      {searchTerm ? 'No todos match your search.' : 'Start by creating your first todo!'}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={handleCreateTodo}
                        className="bg-primary dark:bg-blue-600 hover:bg-primary-light dark:hover:bg-blue-500 rounded-xl px-6 py-3 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Create Your First Todo</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`bg-background-card dark:bg-background-dark-card rounded-3xl p-6 shadow-2xl border transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl group cursor-pointer theme-transition ${
                      todo.completed
                        ? 'border-green-200 dark:border-green-500/30 bg-green-50/50 dark:bg-green-400/5'
                        : todo.due_date && isOverdue(todo.due_date)
                        ? 'border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-400/5'
                        : 'border-secondary/20 dark:border-border-dark-primary hover:bg-secondary/5 dark:hover:bg-text-dark-secondary/5'
                    }`}
                    onClick={() => handleEditTodo(todo)}
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTodo(todo.id);
                        }}
                        className={`mt-1 flex-shrink-0 transition-all duration-200 ${
                          todo.completed ? 'text-green-600 dark:text-green-400' : 'text-text-secondary dark:text-text-dark-secondary hover:text-primary dark:hover:text-primary-light'
                        }`}
                      >
                        {todo.completed ? (
                          <CheckSquare className="w-6 h-6" />
                        ) : (
                          <Square className="w-6 h-6" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-bold truncate ${
                          todo.completed ? 'text-text-secondary dark:text-text-dark-secondary line-through' : 'text-text-primary dark:text-text-dark-primary'
                        }`}>
                          {todo.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                            <Flag className="w-3 h-3 inline mr-1" />
                            {todo.priority}
                          </span>

                          {todo.due_date && (
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              todo.completed
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                : isOverdue(todo.due_date)
                                ? 'bg-red-100 dark:bg-red-400/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30'
                                : 'bg-blue-100 dark:bg-blue-400/10 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                            }`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {new Date(todo.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {todo.description && (
                          <p className={`text-sm mt-2 line-clamp-2 ${
                            todo.completed ? 'text-text-light dark:text-text-dark-tertiary' : 'text-text-secondary dark:text-text-dark-secondary'
                          }`}>
                            {todo.description}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(todo, 'todo');
                          }}
                          className="p-2 bg-error/10 dark:bg-red-500/10 hover:bg-error/20 dark:hover:bg-red-500/20 rounded-lg text-error dark:text-red-400 hover:text-white dark:hover:text-white transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : activeTab === 'cardano' ? (
              <div className="col-span-full space-y-6">
                {/* 🔥 NEW ANALYTICS BUTTON */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl p-6 border border-purple-200 dark:border-purple-700/50 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300">
                          Blockchain Analytics Dashboard
                        </h3>
                        <p className="text-purple-600 dark:text-purple-400 text-sm">
                          View detailed insights of your Web3 security investments
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/analytics')}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center space-x-2"
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>View Analytics</span>
                    </button>
                  </div>
                </div>
                
                {/* Your existing CardanoWallet component */}
                <CardanoWallet 
                  notes={notes || []}
                  onRefreshNotes={fetchNotes}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <BlockchainAmountModal
        isOpen={isAmountModalOpen}
        onClose={() => {
          setIsAmountModalOpen(false);
          setPendingBlockchainAction(null);
        }}
        onConfirm={pendingBlockchainAction?.callback || (async () => {})}
        action={pendingBlockchainAction?.action || ''}
        title={pendingBlockchainAction?.data?.title || ''}
        itemType={pendingBlockchainAction?.type === 'note' ? 'Note' : 'Todo'}
        loading={false}
      />

      <BlockchainSuccessModal
        isOpen={isBlockchainSuccessModalOpen}
        onClose={() => setIsBlockchainSuccessModalOpen(false)}
        txHash={blockchainSuccessData.txHash}
        action={blockchainSuccessData.action}
        title={blockchainSuccessData.title}
        itemType={blockchainSuccessData.itemType}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
        loading={noteModalLoading}
      />

      <ViewNoteModal
        isOpen={isViewNoteModalOpen}
        onClose={() => setIsViewNoteModalOpen(false)}
        onEdit={handleEditFromView}
        onToggleFavorite={handleToggleFavorite}
        note={viewingNote}
      />

      <TodoModal
        isOpen={isTodoModalOpen}
        onClose={() => setIsTodoModalOpen(false)}
        onSave={handleSaveTodo}
        todo={editingTodo}
        loading={todoModalLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        noteTitle={selectedNotes.length > 1 ? `${selectedNotes.length} notes` : (itemToDelete?.title || '')}
        loading={deleteLoading}
      />
      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={pendingBulkDelete}
        onClose={() => setPendingBulkDelete(false)}
        onConfirm={confirmBulkDeleteNotes}
        noteTitle={`${selectedNotes.length} notes`}
        loading={deleteLoading}
      />

      {/* Recycle Bin Modal */}
      <RecycleBinModal
        isOpen={isRecycleBinModalOpen}
        onClose={() => setIsRecycleBinModalOpen(false)}
        onRefresh={fetchNotes}
      />
    </>
  );
};

export default Dashboard;