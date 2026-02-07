import React from 'react';

export const VideoPlayerModal = ({ videoId, onClose }) => {
  return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={onClose}>
          <div className="bg-black p-2 rounded-lg shadow-2xl w-full max-w-4xl aspect-video relative" onClick={e => e.stopPropagation()}>
              <button onClick={onClose} className="absolute -top-4 -right-4 w-8 h-8 bg-white text-black rounded-full z-10">&times;</button>
              <iframe
  title="YouTube Video Player"
  src={`https://www.youtube.com/embed/${videoId}`}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full rounded-lg"
              ></iframe>
          </div>
      </div>
  );
};
