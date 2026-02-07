import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const JoinRoomModal = ({ isOpen, onClose, onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Validate room exists
      const response = await fetch(`http://localhost:8000/api/rooms/${roomId}`);
      
      if (!response.ok) {
        throw new Error('Room not found or expired');
      }

      const roomData = await response.json();
      
      // Navigate to video call page
      navigate(`/room/${roomId}`, {
        state: {
          companion: { id: roomData.companionId },
          roomId: roomId,
          userId: localStorage.getItem('userId') || `user_${Date.now()}`
        }
      });

      onClose();
    } catch (err) {
      console.error('Join room error:', err);
      setError(err.message || 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Join Room</h2>
        
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID (e.g., phys-abc123)"
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
          onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
          
          <button
            onClick={onClose}
            disabled={isJoining}
            className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
