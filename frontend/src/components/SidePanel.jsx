import React from 'react';
import { ChatPanel } from './ChatPanel';
import { NotesPanel } from './NotesPanel';
import { ParticipantsPanel } from './ParticipantsPanel';
import { WhiteboardPanel } from './WhiteboardPanel';

export const SidePanel = ({
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
  return (
    <div className="h-full flex flex-col bg-gray-900 relative">
      {/* Header with centered title only */}
      <div className="flex items-center justify-center px-4 py-3 border-b border-gray-700 bg-gray-800">
        <h3 className="text-base font-medium text-white">
          {activePanel === 'chat' && '💬 Chat'}
          {activePanel === 'participants' && '👥 Participants'}
          {activePanel === 'notes' && '📝 Notes'}
          {activePanel === 'whiteboard' && '🎨 Whiteboard'}
        </h3>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'chat' && (
          <ChatPanel
            companion={companion}
            messages={messages}
            onSendMessage={onSendMessage}
            onStopAI={onStopAI}
            isListening={isListening}
            startListening={startListening}
            stopListening={stopListening}
          />
        )}

        {activePanel === 'participants' && (
          <ParticipantsPanel participants={participants} />
        )}

        {activePanel === 'notes' && <NotesPanel roomId={roomId} />}

        {activePanel === 'whiteboard' && <WhiteboardPanel roomId={roomId} />}
      </div>
    </div>
  );
};

export default SidePanel;
