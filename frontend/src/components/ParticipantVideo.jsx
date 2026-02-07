import React, { useRef, useEffect } from 'react';
import { getDisplayName } from '../utils/userSession';

export const ParticipantVideo = ({ participant }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      videoRef.current.play().catch(e => console.warn('Video autoplay blocked:', e));
    }
  }, [participant.stream]);

  return (
    <div className="relative w-40 h-28 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-blue-500 transition-colors">
      
      {/* Video Element */}
      {participant.stream && !participant.isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        /* Video Off - Show Avatar */
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-5xl">👤</div>
        </div>
      )}

      {/* Name and Status Overlay */}
      <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center gap-1">
        <span className="font-medium">{getDisplayName(participant.userId)}</span>
        {participant.isMuted ? (
          <span title="Muted">🔇</span>
        ) : (
          <span title="Unmuted">🎤</span>
        )}
      </div>

      {/* Speaking Indicator */}
      {participant.isSpeaking && (
        <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none animate-pulse"></div>
      )}
    </div>
  );
};
