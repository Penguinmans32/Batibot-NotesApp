import React from 'react';
import { 
  X, 
  FileText, 
  Calendar,
  Tag,
  Edit3,
  Heart
} from 'lucide-react';
import { Note } from '../types/Note';

interface ViewNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onToggleFavorite?: (id: number) => void;
  note: Note | null;
}

const ViewNoteModal: React.FC<ViewNoteModalProps> = ({ 
  isOpen, 
  onClose, 
  onEdit, 
  onToggleFavorite, 
  note 
}) => {
  if (!isOpen || !note) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-background-card rounded-3xl w-full max-w-4xl max-h-[95vh] shadow-2xl border border-secondary/20 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary/20 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">View Note</h2>
            </div>
            <div className="flex items-center space-x-2">
              {/* Favorite Button */}
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(note.id)}
                  className={`p-2 rounded-xl transition-colors duration-200 ${
                    note.favorite 
                      ? 'text-pink-500 hover:bg-pink-50' 
                      : 'text-text-secondary hover:text-pink-500 hover:bg-secondary/10'
                  }`}
                  title={note.favorite ? 'Unfavorite' : 'Favorite'}
                >
                  <Heart className="w-5 h-5" fill={note.favorite ? 'currentColor' : 'none'} />
                </button>
              )}
              
              {/* Edit Button */}
              <button
                onClick={onEdit}
                className="p-2 bg-primary hover:bg-primary-light rounded-xl text-white transition-colors duration-200"
                title="Edit Note"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary/10 rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                  {note.title}
                </h1>
                
                {/* Metadata */}
                <div className="flex items-center space-x-4 text-text-secondary text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                  {note.updated_at !== note.created_at && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Updated: {new Date(note.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="w-4 h-4" />
                      <span>{note.tags.length} tag{note.tags.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-text-secondary font-medium text-sm mb-3">Tags & Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{ backgroundColor: tag.color, color: '#fff' }}
                        className="px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-text-secondary font-medium text-sm mb-3">Content</h3>
                <div 
                  className="prose prose-sm max-w-none text-text-primary bg-background-light border border-secondary/20 rounded-xl p-4"
                  style={{
                    minHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 pt-4 border-t border-secondary/20 flex-shrink-0">
            <div className="text-text-secondary text-sm">
              Last modified: {new Date(note.updated_at).toLocaleString()}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="bg-background-light hover:bg-secondary/10 border border-secondary/20 rounded-xl px-6 py-2 text-text-secondary font-medium transition-all duration-300"
              >
                Close
              </button>
              <button
                onClick={onEdit}
                className="bg-primary hover:bg-primary-light rounded-xl px-6 py-2 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Note</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .prose blockquote {
          border-left: 4px solid #3B82F6;
          margin: 10px 0;
          padding-left: 15px;
          font-style: italic;
          color: #6B7280;
          background-color: #F3F4F6;
          border-radius: 4px;
          padding: 10px 15px;
        }

        .prose ul, .prose ol {
          margin: 10px 0;
          padding-left: 20px;
        }

        .prose li {
          margin: 5px 0;
        }

        .prose a {
          color: #3B82F6;
          text-decoration: underline;
        }

        .prose hr {
          border: none;
          border-top: 2px solid #E5E7EB;
          margin: 20px 0;
        }

        .prose h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 15px 0 10px 0;
          color: #111827;
        }

        .prose h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 12px 0 8px 0;
          color: #111827;
        }

        .prose h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 10px 0 6px 0;
          color: #111827;
        }

        .prose p {
          margin: 5px 0;
          line-height: 1.6;
        }

        .prose table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
          border: 1px solid #E5E7EB;
        }

        .prose td, .prose th {
          border: 1px solid #E5E7EB;
          padding: 8px 12px;
          text-align: left;
        }

        .prose th {
          background-color: #F9FAFB;
          font-weight: 600;
        }

        .prose code {
          background-color: #F3F4F6;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
      `}</style>
    </>
  );
};

export default ViewNoteModal;