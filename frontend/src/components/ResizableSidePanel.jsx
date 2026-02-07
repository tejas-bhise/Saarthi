import React, { useState, useRef, useEffect } from 'react';
import { SidePanel } from './SidePanel';

export const ResizableSidePanel = ({ 
  activePanel, 
  setActivePanel, 
  messages, 
  onSendMessage, 
  roomId, 
  companion,
  userId,
  onStopAI,
  startListening,
  stopListening,
  isListening,
  participants,
}) => {
  const [width, setWidth] = useState(30); // 30% default
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const containerWidth = window.innerWidth;
      const newWidth = ((containerWidth - e.clientX) / containerWidth) * 100;
      
      // Constrain between 20% and 60%
      const clampedWidth = Math.max(20, Math.min(60, newWidth));
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <>
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 bottom-0 w-1 hover:w-2 bg-gray-700 hover:bg-blue-500 cursor-col-resize z-50 transition-all ${
          isResizing ? 'bg-blue-500 w-2' : ''
        }`}
        style={{ right: `${width}%` }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-white/30 rounded-full"></div>
      </div>

      {/* Side Panel */}
      <div 
        ref={containerRef}
        className="bg-gray-900 flex flex-col h-full transition-all"
        style={{ width: `${width}%` }}
      >
        <SidePanel
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          messages={messages}
          onSendMessage={onSendMessage}
          roomId={roomId}
          companion={companion}
          userId={userId}
          onStopAI={onStopAI}
          startListening={startListening}
          stopListening={stopListening}
          isListening={isListening}
          participants={participants}
        />
      </div>
    </>
  );
};
