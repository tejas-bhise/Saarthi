import React from 'react';

export const ParticipantsPanel = ({ participants = [] }) => {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-3 bg-gray-900">
      {participants.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <p className="text-lg">No participants yet</p>
        </div>
      )}

      {participants.map((participant, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg border border-gray-700"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
            {participant.userId.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-100">
              {participant.userId.substring(0, 20)}...
            </p>
            <p className="text-xs text-gray-400">
              {participant.role || 'Participant'}
            </p>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};
