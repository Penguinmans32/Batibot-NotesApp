import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  FileText, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link,
  Type,
  Palette,
  Minus
} from 'lucide-react';

interface Note {
  id?: number;
  title: string;
  content: string;
}

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  note?: Note | null;
  loading?: boolean;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSave, note, loading = false }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState('14');
  const [fontFamily, setFontFamily] = useState('Inter');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      if (contentRef.current) {
        contentRef.current.innerHTML = note.content || '';
      }
    } else {
      setTitle('');
      setContent('');
      if (contentRef.current) {
        contentRef.current.innerHTML = '';
      }
    }
  }, [note, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentRef.current?.innerHTML.trim()) return;
    
    onSave({
      id: note?.id,
      title: title.trim(),
      content: contentRef.current?.innerHTML || ''
    });
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  const insertList = (ordered: boolean) => {
    executeCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
    executeCommand('fontSize', '3');
    // Apply custom font size
    if (contentRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const span = document.createElement('span');
          span.style.fontSize = size + 'px';
          range.surroundContents(span);
        }
      }
    }
  };

  const changeFontFamily = (family: string) => {
    setFontFamily(family);
    executeCommand('fontName', family);
  };

  const changeTextColor = (color: string) => {
    executeCommand('foreColor', color);
  };

  const insertHorizontalRule = () => {
    executeCommand('insertHorizontalRule');
  };

  const createLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-white/20 animate-float flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {note ? 'Edit Note' : 'Create New Note'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Title Input */}
          <div className="p-6 pb-4 flex-shrink-0">
            <label className="text-white/80 font-medium text-sm block mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              placeholder="Enter note title..."
              required
            />
          </div>

          {/* Rich Text Toolbar */}
          <div className="px-6 pb-4 flex-shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              {/* First Row - Font Controls */}
              <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-white/10">
                <select
                  value={fontFamily}
                  onChange={(e) => changeFontFamily(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times</option>
                  <option value="Courier New">Courier</option>
                  <option value="Helvetica">Helvetica</option>
                </select>

                <select
                  value={fontSize}
                  onChange={(e) => changeFontSize(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="10">10px</option>
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                  <option value="24">24px</option>
                  <option value="28">28px</option>
                  <option value="32">32px</option>
                </select>

                <div className="w-px h-6 bg-white/20"></div>

                {/* Color Picker */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => changeTextColor('#ff0000')}
                    className="w-6 h-6 bg-red-500 rounded border border-white/20 hover:scale-110 transition-transform"
                  ></button>
                  <button
                    type="button"
                    onClick={() => changeTextColor('#00ff00')}
                    className="w-6 h-6 bg-green-500 rounded border border-white/20 hover:scale-110 transition-transform"
                  ></button>
                  <button
                    type="button"
                    onClick={() => changeTextColor('#0000ff')}
                    className="w-6 h-6 bg-blue-500 rounded border border-white/20 hover:scale-110 transition-transform"
                  ></button>
                  <button
                    type="button"
                    onClick={() => changeTextColor('#ffff00')}
                    className="w-6 h-6 bg-yellow-500 rounded border border-white/20 hover:scale-110 transition-transform"
                  ></button>
                  <button
                    type="button"
                    onClick={() => changeTextColor('#ff00ff')}
                    className="w-6 h-6 bg-purple-500 rounded border border-white/20 hover:scale-110 transition-transform"
                  ></button>
                  <button
                    type="button"
                    onClick={() => changeTextColor('#ffffff')}
                    className="w-6 h-6 bg-white rounded border border-white/20 hover:scale-110 transition-transform"
                  ></button>
                </div>
              </div>

              {/* Second Row - Formatting Controls */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => executeCommand('bold')}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('italic')}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('underline')}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-white/20 mx-2"></div>

                <button
                  type="button"
                  onClick={() => executeCommand('justifyLeft')}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyCenter')}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyRight')}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('justifyFull')}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Justify"
                >
                  <AlignJustify className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-white/20 mx-2"></div>

                <button
                  type="button"
                  onClick={() => insertList(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertList(true)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-white/20 mx-2"></div>

                <button
                  type="button"
                  onClick={() => executeCommand('formatBlock', 'blockquote')}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={createLink}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Insert Link"
                >
                  <Link className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={insertHorizontalRule}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all duration-200"
                  title="Horizontal Line"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="px-6 flex-1 flex flex-col overflow-hidden">
            <label className="text-white/80 font-medium text-sm block mb-2">
              Content
            </label>
            <div 
              ref={contentRef}
              contentEditable
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 overflow-y-auto"
              style={{ 
                minHeight: '300px',
                fontFamily: fontFamily,
                fontSize: fontSize + 'px'
              }}
              onInput={() => {
                if (contentRef.current) {
                  setContent(contentRef.current.innerHTML);
                }
              }}
              data-placeholder="Start writing your note here... Use the toolbar above to format your text!"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 p-6 pt-4 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-3 text-white font-medium transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !contentRef.current?.innerHTML.trim()}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl py-3 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{note ? 'Update Note' : 'Create Note'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        [contenteditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }
        
        [contenteditable="true"]:focus:before {
          content: "";
        }

        [contenteditable] blockquote {
          border-left: 4px solid rgba(139, 92, 246, 0.5);
          margin: 10px 0;
          padding-left: 15px;
          font-style: italic;
          color: rgba(255, 255, 255, 0.8);
        }

        [contenteditable] ul, [contenteditable] ol {
          margin: 10px 0;
          padding-left: 20px;
        }

        [contenteditable] li {
          margin: 5px 0;
        }

        [contenteditable] a {
          color: #8b5cf6;
          text-decoration: underline;
        }

        [contenteditable] hr {
          border: none;
          border-top: 2px solid rgba(255, 255, 255, 0.2);
          margin: 20px 0;
        }
      `}</style>
    </div>
  );
};

export default NoteModal;