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
  Minus,
  Type,
  Palette,
  RotateCcw,
  RotateCw,
  Strikethrough,
  Subscript,
  Superscript,
  Code,
  Image,
  Table,
  ChevronDown,
  Eye,
  Edit
} from 'lucide-react';
import { Note, NoteTag } from '../types/Note';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: { id?: number; title: string; content: string; tags?: NoteTag[] }) => void;
  note?: Note | null;
  loading?: boolean;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSave, note, loading = false }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fontSize, setFontSize] = useState('14');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Tag system
  const defaultTags: NoteTag[] = [
    { name: 'Shopping List', color: '#3B82F6' },
    { name: 'Bucketlist', color: '#F59E0B' },
    { name: 'Work', color: '#10B981' },
    { name: 'Personal', color: '#F43F5E' },
    { name: 'Ideas', color: '#8B5CF6' },
    { name: 'Urgent', color: '#EF4444' }
  ];
  const [allTags, setAllTags] = useState<NoteTag[]>(defaultTags);
  const [selectedTags, setSelectedTags] = useState<NoteTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366F1');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTags(note.tags || []);
      setWordCount(countWords(note.content || ''));
      setCharCount(countCharacters(note.content || ''));
      if (contentRef.current) {
        contentRef.current.innerHTML = note.content || '';
      }
      // Add any tags from the note that aren't in allTags
      if (note.tags) {
        setAllTags(prev => {
          const extraTags = note.tags?.filter(t => !prev.some(pt => pt.name === t.name)) || [];
          return extraTags.length > 0 ? [...prev, ...extraTags] : prev;
        });
      }
    } else {
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setWordCount(0);
      setCharCount(0);
      if (contentRef.current) {
        contentRef.current.innerHTML = '';
      }
    }
  }, [note, isOpen]);

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const exists = allTags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase());
    if (!exists) {
      const tag: NoteTag = { name: newTagName.trim(), color: newTagColor };
      setAllTags([...allTags, tag]);
      setSelectedTags([...selectedTags, tag]);
      setNewTagName('');
      setNewTagColor('#6366F1');
    }
  };

  const handleToggleTag = (tag: NoteTag) => {
    if (selectedTags.some(t => t.name === tag.name)) {
      setSelectedTags(selectedTags.filter(t => t.name !== tag.name));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentRef.current?.innerHTML.trim()) return;

    onSave({
      id: note?.id,
      title: title.trim(),
      content: contentRef.current?.innerHTML || '',
      tags: selectedTags
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
    if (contentRef.current) {
      contentRef.current.style.fontSize = size + 'px';
    }
  };

  const changeFontFamily = (family: string) => {
    setFontFamily(family);
    executeCommand('fontName', family);
  };

  const changeTextColor = (color: string) => {
    executeCommand('foreColor', color);
    setShowColorPicker(false);
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

  const insertHeading = (level: string) => {
    executeCommand('formatBlock', `h${level}`);
    setShowHeadingDropdown(false);
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:') || '3';
    const cols = prompt('Number of columns:') || '3';
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';

    for (let i = 0; i < parseInt(rows); i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < parseInt(cols); j++) {
        tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';

    executeCommand('insertHTML', tableHTML);
  };

  const countWords = (text: string) => {
    // Remove HTML tags and count words
    const plainText = text.replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  const countCharacters = (text: string) => {
    // Remove HTML tags and count characters (excluding spaces)
    const plainText = text.replace(/<[^>]*>/g, '');
    return plainText.length;
  };

  const openPreviewModal = () => {
    if (contentRef.current) {
      // Save current content before opening preview
      setContent(contentRef.current.innerHTML);
    }
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#000080', '#800000',
    '#808080', '#C0C0C0', '#FFFFFF', '#F0F0F0'
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-background-card rounded-3xl w-full max-w-5xl max-h-[95vh] shadow-2xl border border-secondary/20 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary/20 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                {note ? 'Edit Note' : 'Create New Note'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary/10 rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
            {/* Title Input */}
            <div className="p-6 pb-4 flex-shrink-0">
              <label className="text-text-secondary font-medium text-sm block mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background-light border border-secondary/20 rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                placeholder="Enter note title..."
                required
              />
            </div>

            {/* Tags Section */}
            <div className="px-6 pb-4 flex-shrink-0">
              <label className="text-text-secondary font-medium text-sm block mb-2">
                Tags & Categories
              </label>
              <div className="bg-background-light border border-secondary/20 rounded-xl p-4">
                {/* Existing Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {allTags.map(tag => (
                    <button
                      type="button"
                      key={tag.name}
                      onClick={() => handleToggleTag(tag)}
                      style={{ 
                        backgroundColor: tag.color, 
                        color: '#fff',
                        border: selectedTags.some(t => t.name === tag.name) ? '2px solid #111827' : '2px solid transparent'
                      }}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 focus:outline-none"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>

                {/* Create New Tag */}
                <div className="flex items-center gap-2 pt-2 border-t border-secondary/20">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Create new tag..."
                    className="flex-1 bg-background-card border border-secondary/20 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-10 h-10 p-1 border border-secondary/20 rounded-lg cursor-pointer"
                    title="Choose tag color"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-light transition-all duration-200"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Tags Preview */}
                {selectedTags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-secondary/20">
                    <span className="text-text-secondary text-xs font-medium mb-2 block">Selected tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <span
                          key={tag.name}
                          style={{ backgroundColor: tag.color, color: '#fff' }}
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Rich Text Toolbar */}
            <div className="px-6 pb-4 flex-shrink-0">
              <div className="bg-background-light border border-secondary/20 rounded-xl p-4 space-y-3">
                {/* First Row - Font and Text Style */}
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  {/* Font Family */}
                  <select
                    value={fontFamily}
                    onChange={(e) => changeFontFamily(e.target.value)}
                    className="bg-background-card border border-secondary/20 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[120px]"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times</option>
                    <option value="Courier New">Courier</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>

                  {/* Font Size */}
                  <select
                    value={fontSize}
                    onChange={(e) => changeFontSize(e.target.value)}
                    className="bg-background-card border border-secondary/20 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[80px]"
                  >
                    <option value="8">8px</option>
                    <option value="10">10px</option>
                    <option value="12">12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                    <option value="20">20px</option>
                    <option value="24">24px</option>
                    <option value="28">28px</option>
                    <option value="32">32px</option>
                    <option value="36">36px</option>
                    <option value="48">48px</option>
                  </select>

                  {/* Heading Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
                      className="bg-background-card border border-secondary/20 rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary flex items-center space-x-2 min-w-[100px]"
                    >
                      <Type className="w-4 h-4" />
                      <span>Heading</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showHeadingDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-background-card border border-secondary/20 rounded-lg shadow-lg z-10 min-w-[140px]">
                        <button
                          type="button"
                          onClick={() => executeCommand('formatBlock', 'p')}
                          className="w-full text-left px-3 py-2 hover:bg-secondary/10 text-text-primary text-sm"
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHeading('1')}
                          className="w-full text-left px-3 py-2 hover:bg-secondary/10 text-text-primary text-lg font-bold"
                        >
                          Heading 1
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHeading('2')}
                          className="w-full text-left px-3 py-2 hover:bg-secondary/10 text-text-primary text-base font-bold"
                        >
                          Heading 2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertHeading('3')}
                          className="w-full text-left px-3 py-2 hover:bg-secondary/10 text-text-primary text-sm font-bold"
                        >
                          Heading 3
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Color Picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="p-2 hover:bg-secondary/10 rounded-lg border border-secondary/20 transition-all duration-200 flex items-center space-x-1"
                      title="Text Color"
                    >
                      <Palette className="w-4 h-4 text-text-secondary" />
                      <ChevronDown className="w-3 h-3 text-text-secondary" />
                    </button>
                    {showColorPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-background-card border border-secondary/20 rounded-lg shadow-lg z-10 p-3">
                        <div className="grid grid-cols-4 gap-1 w-32">
                          {colors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => changeTextColor(color)}
                              className="w-6 h-6 rounded border border-secondary/20 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Second Row - Text Formatting */}
                <div className="flex items-center space-x-1 flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => executeCommand('undo')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Undo"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('redo')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Redo"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <div className="w-px h-6 bg-secondary/20 mx-2"></div>

                  <button
                    type="button"
                    onClick={() => executeCommand('bold')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('italic')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('underline')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('strikethrough')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('subscript')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Subscript"
                  >
                    <Subscript className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('superscript')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Superscript"
                  >
                    <Superscript className="w-4 h-4" />
                  </button>

                  <div className="w-px h-6 bg-secondary/20 mx-2"></div>

                  <button
                    type="button"
                    onClick={() => executeCommand('justifyLeft')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('justifyCenter')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('justifyRight')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('justifyFull')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Justify"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>

                  <div className="w-px h-6 bg-secondary/20 mx-2"></div>

                  <button
                    type="button"
                    onClick={() => insertList(false)}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertList(true)}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>

                  <div className="w-px h-6 bg-secondary/20 mx-2"></div>

                  <button
                    type="button"
                    onClick={() => executeCommand('formatBlock', 'blockquote')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => executeCommand('insertHTML', '<code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: monospace;"></code>')}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Inline Code"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={createLink}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Insert Link"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={insertTable}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Insert Table"
                  >
                    <Table className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={insertHorizontalRule}
                    className="p-2 hover:bg-secondary/10 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200"
                    title="Horizontal Line"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="px-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <label className="text-text-secondary font-medium text-sm">
                  Content
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={openPreviewModal}
                    className="flex items-center space-x-2 px-3 py-1 bg-background-card hover:bg-secondary/10 border border-secondary/20 rounded-lg text-text-secondary hover:text-text-primary transition-all duration-200 text-xs"
                    title="Open Preview"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                  <span className="text-text-secondary text-xs">
                    {wordCount} words • {charCount} characters
                  </span>
                </div>
              </div>
              {/* Rich Text Editor - Always in Edit Mode */}
              <div
                ref={contentRef}
                contentEditable
                className="rich-editor bg-background-light border border-secondary/20 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 overflow-y-auto"
                style={{
                  minHeight: '400px',
                  height: '400px',
                  fontFamily: fontFamily,
                  fontSize: fontSize + 'px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word'
                }}
                onInput={() => {
                  if (contentRef.current) {
                    const newContent = contentRef.current.innerHTML;
                    setContent(newContent);
                    setWordCount(countWords(newContent));
                    setCharCount(countCharacters(newContent));
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
                className="flex-1 bg-background-light hover:bg-secondary/10 border border-secondary/20 rounded-xl py-3 text-text-secondary font-medium transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="flex-1 bg-primary hover:bg-primary-light disabled:bg-secondary disabled:opacity-50 rounded-xl py-3 text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center space-x-2"
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
      </div>

      <style>{`
        .rich-editor[contenteditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: #6B7280;
          font-style: italic;
          pointer-events: none;
        }

        .rich-editor[contenteditable="true"]:focus:before {
          content: "";
        }

        .preview-content {
          cursor: default;
        }

        .rich-editor blockquote,
        .preview-content blockquote {
          border-left: 4px solid #3B82F6;
          margin: 10px 0;
          padding-left: 15px;
          font-style: italic;
          color: #6B7280;
          background-color: #F3F4F6;
          border-radius: 4px;
          padding: 10px 15px;
        }

        .rich-editor ul, .rich-editor ol,
        .preview-content ul, .preview-content ol {
          margin: 10px 0;
          padding-left: 20px;
        }

        .rich-editor li,
        .preview-content li {
          margin: 5px 0;
        }

        .rich-editor a,
        .preview-content a {
          color: #3B82F6;
          text-decoration: underline;
        }

        .rich-editor hr,
        .preview-content hr {
          border: none;
          border-top: 2px solid #E5E7EB;
          margin: 20px 0;
        }

        .rich-editor h1,
        .preview-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 15px 0 10px 0;
          color: #111827;
        }

        .rich-editor h2,
        .preview-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 12px 0 8px 0;
          color: #111827;
        }

        .rich-editor h3,
        .preview-content h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 10px 0 6px 0;
          color: #111827;
        }

        .rich-editor p,
        .preview-content p {
          margin: 5px 0;
          line-height: 1.6;
        }

        .rich-editor table,
        .preview-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
          border: 1px solid #E5E7EB;
        }

        .rich-editor td, .rich-editor th,
        .preview-content td, .preview-content th {
          border: 1px solid #E5E7EB;
          padding: 8px 12px;
          text-align: left;
        }

        .rich-editor th,
        .preview-content th {
          background-color: #F9FAFB;
          font-weight: 600;
        }

        .rich-editor code,
        .preview-content code {
          background-color: #F3F4F6;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
      `}</style>

      {/* Separate Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-background-card rounded-3xl w-full max-w-4xl max-h-[95vh] shadow-2xl border border-secondary/20 flex flex-col overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary/20 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Note Preview</h2>
                  <p className="text-sm text-text-secondary">{title || 'Untitled Note'}</p>
                </div>
              </div>
              <button
                onClick={closePreviewModal}
                className="p-2 hover:bg-secondary/10 rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Tags Display */}
              {selectedTags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-text-secondary mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <span
                        key={tag.name}
                        style={{ backgroundColor: tag.color, color: '#fff' }}
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Note Content */}
              <div className="prose prose-lg max-w-none">
                <div
                  className="preview-content text-text-primary"
                  style={{
                    fontFamily: fontFamily,
                    fontSize: fontSize + 'px',
                    lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: content || '<p style="color: #6B7280; font-style: italic;">No content to preview...</p>' 
                  }}
                />
              </div>

              {/* Statistics */}
              <div className="mt-6 pt-4 border-t border-secondary/20">
                <div className="flex items-center space-x-6 text-sm text-text-secondary">
                  <span>{wordCount} words</span>
                  <span>{charCount} characters</span>
                </div>
              </div>
            </div>

            {/* Preview Footer */}
            <div className="p-6 pt-4 border-t border-secondary/20 flex-shrink-0">
              <button
                onClick={closePreviewModal}
                className="w-full bg-primary hover:bg-primary-light rounded-xl py-3 text-white font-semibold transition-all duration-300"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NoteModal;