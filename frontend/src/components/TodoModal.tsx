import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Flag } from 'lucide-react';
import { Todo } from '../types/Todo';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: Partial<Todo>) => void;
  todo?: Todo | null;
  loading: boolean;
}

const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  todo,
  loading
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setPriority(todo.priority);
      setDueDate(todo.due_date ? todo.due_date.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  }, [todo, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: todo?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || undefined,
    });
  };

  const priorityColors = {
    low: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
    medium: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
    high: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-background-card dark:bg-background-dark-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-secondary/20 dark:border-text-dark-secondary/20 transform transition-all duration-300 scale-100 theme-transition">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            {todo ? 'Edit Todo' : 'New Todo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/10 dark:hover:bg-text-dark-secondary/10 rounded-xl transition-colors duration-200"
          >
            <X className="w-5 h-5 text-text-secondary dark:text-text-dark-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-primary dark:text-text-dark-primary font-semibold mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background-light dark:bg-background-dark-lighter border border-secondary/20 dark:border-text-dark-secondary/20 rounded-xl px-4 py-3 text-text-primary dark:text-text-dark-primary placeholder-text-secondary dark:placeholder-text-dark-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label className="block text-text-primary dark:text-text-dark-primary font-semibold mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background-light dark:bg-background-dark-lighter border border-secondary/20 dark:border-text-dark-secondary/20 rounded-xl px-4 py-3 text-text-primary dark:text-text-dark-primary placeholder-text-secondary dark:placeholder-text-dark-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 min-h-[80px]"
              placeholder="Add more details..."
            />
          </div>

          <div>
            <label className="block text-text-primary dark:text-text-dark-primary font-semibold mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                    priority === p
                      ? priorityColors[p]
                      : 'bg-background-light dark:bg-background-dark-lighter border-secondary/20 dark:border-text-dark-secondary/20 text-text-secondary dark:text-text-dark-secondary hover:bg-secondary/5 dark:hover:bg-text-dark-secondary/10'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  <span className="capitalize font-medium">{p}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-text-primary dark:text-text-dark-primary font-semibold mb-2">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-dark-secondary w-5 h-5" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-background-light dark:bg-background-dark-lighter border border-secondary/20 dark:border-text-dark-secondary/20 rounded-xl pl-12 pr-4 py-3 text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary/10 dark:bg-text-dark-secondary/10 hover:bg-secondary/20 dark:hover:bg-text-dark-secondary/20 border border-secondary/30 dark:border-text-dark-secondary/30 rounded-xl px-4 py-3 text-text-secondary dark:text-text-dark-secondary transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="flex-1 bg-primary dark:bg-blue-600 hover:bg-primary-light dark:hover:bg-blue-500 rounded-xl px-4 py-3 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Saving...' : todo ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
      
      <style>{`
        /* Dark mode styles for date picker */
        .dark input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        
        .dark input[type="date"]::-webkit-datetime-edit {
          color: #f3f4f6;
        }
        
        .dark input[type="date"]::-webkit-datetime-edit-text {
          color: #9ca3af;
        }
        
        .dark input[type="date"]::-webkit-datetime-edit-month-field {
          color: #f3f4f6;
        }
        
        .dark input[type="date"]::-webkit-datetime-edit-day-field {
          color: #f3f4f6;
        }
        
        .dark input[type="date"]::-webkit-datetime-edit-year-field {
          color: #f3f4f6;
        }
        
        /* For Firefox */
        @media (prefers-color-scheme: dark) {
          input[type="date"] {
            color-scheme: dark;
          }
        }
        
        .dark input[type="date"] {
          color-scheme: dark;
        }
      `}</style>
    </div>
  );
};

export default TodoModal;