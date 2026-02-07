import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, MicIcon } from './Icons';

export const ChatPanel = ({
  companion,
  messages,
  onSendMessage,
  startListening,
  stopListening,
  isListening,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isProcessingVoice = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const handleVoiceClick = () => {
    if (isProcessingVoice.current) return;

    isProcessingVoice.current = true;

    if (isListening) {
      stopListening();
      setTimeout(() => {
        isProcessingVoice.current = false;
      }, 1000);
    } else {
      startListening();
      setTimeout(() => {
        isProcessingVoice.current = false;
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation with your AI tutor!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.timestamp && (
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <div className="px-4 pb-2">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-center text-sm font-medium animate-pulse">
            🎤 Listening... (Speak now)
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={handleVoiceClick}
            disabled={isProcessingVoice.current}
            className={`p-3 rounded-lg transition-colors ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <MicIcon className="w-5 h-5 text-white" />
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <SendIcon className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};
