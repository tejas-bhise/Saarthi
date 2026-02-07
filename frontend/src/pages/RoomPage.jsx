import React, { useState } from 'react';
import { Footer } from '../components/Footer';

export const RoomPage = ({ companion, userId, onJoinRoom, onBack }) => {
  const [roomId, setRoomId] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState('');

  const generateRoomId = () => {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsCreatingRoom(true);
    console.log('📝 Created room:', newRoomId);
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID or create a new room');
      return;
    }
    console.log('🚪 Joining room:', roomId);
    onJoinRoom(roomId);
  };

  const handleJoinExisting = () => {
    setShowJoinModal(true);
  };

  const handleJoinSubmit = () => {
    if (!joinRoomInput.trim()) {
      alert('Please enter a valid Room ID');
      return;
    }
    
    console.log('🚪 Joining existing room:', joinRoomInput.trim());
    setRoomId(joinRoomInput.trim());
    setIsCreatingRoom(false);
    
    // ✅ Immediately join the room
    onJoinRoom(joinRoomInput.trim());
    setShowJoinModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex flex-col">
      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Join Existing Session</h2>
            
            <input
              type="text"
              value={joinRoomInput}
              onChange={(e) => setJoinRoomInput(e.target.value)}
              placeholder="Enter Room ID (e.g., room_123456_abc)"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-6"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinSubmit()}
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={handleJoinSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Join Session
              </button>
              
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinRoomInput('');
                }}
                className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Companion Info Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-center gap-6 mb-6">
              <img
                src={companion.imageUrl}
                alt={companion.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
              />
              <div>
                <h2 className="text-3xl font-bold">{companion.name}</h2>
                <p className="text-blue-300 text-lg">{companion.subject}</p>
                <p className="text-gray-300 mt-2">{companion.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {companion.expertise.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-500/30 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Room Options */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">Start Your Session</h3>

            {!isCreatingRoom ? (
              <div className="space-y-4">
                {/* Create New Room */}
                <button
                  onClick={handleCreateRoom}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-lg hover:scale-105 transform transition-all duration-300 shadow-xl"
                >
                  🎓 Create New Session
                </button>

                {/* Join Existing Room */}
                <button
                  onClick={handleJoinExisting}
                  className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-lg transition-all duration-300 border-2 border-white/30"
                >
                  🚪 Join Existing Session
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Room ID Display */}
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <label className="block text-sm text-gray-400 mb-2">Your Room ID:</label>
                  <div className="flex items-center justify-between bg-gray-900/50 rounded-lg px-4 py-3">
                    <code className="text-blue-300 font-mono">{roomId}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomId);
                        alert('Room ID copied to clipboard!');
                      }}
                      className="text-sm bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Share this ID with others to invite them to your session
                  </p>
                </div>

                {/* Join Button */}
                <button
                  onClick={handleJoinRoom}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl font-semibold text-lg hover:scale-105 transform transition-all duration-300 shadow-xl"
                >
                  🚀 Start Learning Session
                </button>

                {/* Back Button */}
                <button
                  onClick={() => setIsCreatingRoom(false)}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all duration-300"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 text-white">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-semibold mb-1">Pro Tip:</p>
                <p className="text-sm text-gray-300">
                  You can use voice commands, text chat, whiteboard, and notes during your session. 
                  Invite friends by sharing your room ID!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
