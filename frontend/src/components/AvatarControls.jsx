import React from 'react';

export const AvatarControls = ({ onPlayAnimation }) => {
  const animations = [
    
    { id: 'walk', label: '🚶 Walk', emoji: '🚶' },
    { id: 'dance', label: '💃 Dance', emoji: '💃' },
    { id: 'jump', label: '🦘 Jump', emoji: '🦘' },
    { id: 'crouch', label: '🧎 Crouch', emoji: '🧎' },
  ];

  return (
    <div className="absolute bottom-24 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-2xl border border-gray-700 z-10">
      <p className="text-white text-xs font-bold mb-2 text-center">Avatar Actions</p>
      <div className="grid grid-cols-2 gap-2">
        {animations.map((anim) => (
          <button
            key={anim.id}
            onClick={() => onPlayAnimation(anim.id)}
            className="bg-gray-700 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-all hover:scale-105 active:scale-95"
          >
            {anim.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
