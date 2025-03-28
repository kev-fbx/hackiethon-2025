import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';

const NotepadWidget = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [notes, setNotes] = useState(localStorage.getItem('widgetNotes') || '');

  useEffect(() => {
    localStorage.setItem('widgetNotes', notes);
  }, [notes]);

  return (
    <div className="relative mx-auto w-full max-w-[900px]">
  {/* Container with pointer-events-none to allow clicking through */}
  <div className="relative flex flex-col w-64 h-48 pointer-events-none">
    {/* Notepad - restore pointer events when visible */}
    <div 
      className={`relative top-0 right-0 w-full h-40 bg-white rounded-lg shadow-xl p-3 flex flex-col transition-opacity duration-200 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <textarea
        className="w-full h-full border-none outline-none resize-none p-2 text-sm text-black"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write your notes here..."
        disabled={!isOpen}
      />
    </div>
    
    {/* Button with pointer-events-auto to make it clickable */}
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="relative w-12 bottom-0 left-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all pointer-events-auto"
    >
      <Edit3 className="min-w-6 min-h-6" />
    </button>
  </div>
</div>
  );
};

export default NotepadWidget;
