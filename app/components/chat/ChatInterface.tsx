'use client';

import React, { useState } from 'react'; // Added useState for local input
import { useMessages } from '@/hooks/useMessages';
import { useTyping } from '@/hooks/useTyping';
// import { useReactions } from '@/hooks/useReactions'; // To be created
// import { MessageList } from './MessageList'; // To be created
// import { MessageInput } from './MessageInput'; // To be created
// import { TypingIndicator } from './TypingIndicator'; // To be created
import { ErrorDisplay } from './ErrorDisplay'; 

import type { MessageWithStatus } from '@/types';

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string; // Added to pass to hooks like useTyping, useReactions
  isDemoMode?: boolean;
  initialMockMessages?: MessageWithStatus[];
}

export function ChatInterface({
  conversationId,
  currentUserId,
  isDemoMode = false,
  initialMockMessages,
}: ChatInterfaceProps) {
  const { messages, sendMessage, error: messagesError, loading: messagesLoading, fetchMessages } = useMessages(
    conversationId,
    isDemoMode ? initialMockMessages : undefined // Pass mock messages if in demo mode
  );
  const { typingUsers, sendTypingStatus } = useTyping(conversationId, currentUserId);
  // const { addReaction } = useReactions(conversationId, currentUserId); // Placeholder
  
  const [localMessage, setLocalMessage] = useState(''); // For controlled input

  // Removed local isTyping/handleTyping as useTyping will manage this
  // const [isTyping, setIsTyping] = useState(false); 
  // const handleTyping = (typing: boolean) => setIsTyping(typing);


  if (messagesLoading) {
    return (
      <div className="flex flex-col h-full bg-white p-4 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-instagram-blue"></div>
        <p className="mt-2 text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (messagesError) {
    return <ErrorDisplay error={messagesError} context="loading messages" onRetry={fetchMessages} />;
  }

  const handleSendMessage = () => {
    if (localMessage.trim()) {
      // Assuming currentUserId is the senderId for now.
      // isAdmin flag would depend on the context (admin dashboard vs user chat)
      // This needs to be passed or determined. For now, defaulting to false.
      sendMessage(localMessage.trim(), currentUserId, false); 
      setLocalMessage('');
      sendTypingStatus(false); // Stop typing after send
    }
  };

  // Placeholder UI until MessageList, MessageInput, TypingIndicator are created
  return (
    <div className="flex flex-col h-full bg-white p-4">
      <h2 className="text-xl font-semibold mb-4">Chat for Conversation ID: {conversationId}</h2>
      <div className="flex-1 border rounded p-2 mb-4 overflow-y-auto">
        {messages.map((msg, index) => ( // msg is now HookMessage type from useMessages
          <div key={msg.id || index} className={`p-2 ${msg.is_admin ? 'text-right' : 'text-left'}`}>
            <span className={`px-3 py-1 rounded-lg ${msg.is_admin ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.content} {msg.status === 'sending' && ' (sending...)'} {msg.status === 'failed' && ' (failed!)'}
            </span>
          </div>
        ))}
      </div>
      {/* Placeholder for TypingIndicator component */}
      {typingUsers.size > 0 && (
        <div className="text-sm text-gray-500 mb-2">
          {/* Displaying the names/IDs of users who are typing */}
          {Array.from(typingUsers.keys()).filter(id => id !== currentUserId).join(', ')} is typing...
        </div>
      )}
      {/* Placeholder for MessageInput component */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={localMessage}
          onChange={(e) => {
            setLocalMessage(e.target.value);
            sendTypingStatus(e.target.value.trim().length > 0);
          }}
          onBlur={() => {
            sendTypingStatus(false);
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="border p-2 rounded w-full flex-1"
        />
        <button 
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!localMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
