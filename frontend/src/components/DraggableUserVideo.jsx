import React, { useState, useRef, useEffect } from 'react';
import { getDisplayName } from '../utils/userSession';

export const DraggableUserVideo = ({ 
  videoRef, 
  userId, 
  isMuted, 
  isVideoOff, 
  isCameraLoading 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'VIDEO') return;
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const videoWidth = 192; // w-48 = 12rem = 192px
    const videoHeight = 144; // h-36 = 9rem = 144px
    
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Calculate boundaries - allow dragging anywhere on screen
    const maxX = window.innerWidth - videoWidth - 32; // 32px padding
    const minX = -(window.innerWidth * 0.7) + 32; // Allow going left
    
    const maxY = window.innerHeight - videoHeight - 120; // 120px for controls
    const minY = -100; // Allow going to top with some padding
    
    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      className={`absolute bottom-24 right-8 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500 shadow-2xl ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } transition-shadow hover:shadow-blue-500/50`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: 50
      }}
    >
      {isCameraLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
          />
          
          {isVideoOff && (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-6xl">👤</div>
            </div>
          )}

          <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <span>{getDisplayName(userId)}</span>
            {isMuted ? <span>🔇</span> : <span>🎤</span>}
          </div>

          <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-gray-300">
            ⋮⋮
          </div>
        </>
      )}
    </div>
  );
};
