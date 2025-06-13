'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTyping } from '@/hooks/useTyping';

interface MessageInputProps {
  conversationId: string;
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function MessageInput({
  conversationId,
  currentUserId,
  onSendMessage,
  disabled = false,
  placeholder = "Message...",
  maxLength = 1000
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendTypingStatus } = useTyping(conversationId, currentUserId);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 5 lines
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Enforce character limit
    if (value.length <= maxLength) {
      setMessage(value);
      adjustTextareaHeight();
      
      // Handle typing indicators
      if (value.trim() && !isSending) {
        sendTypingStatus(true);
      } else {
        sendTypingStatus(false);
      }
    }
  }, [maxLength, adjustTextareaHeight, sendTypingStatus, isSending]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    setIsSending(true);
    sendTypingStatus(false);

    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Re-enable typing if send failed
      if (trimmedMessage) {
        sendTypingStatus(true);
      }
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, disabled, onSendMessage, sendTypingStatus]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter for new line - let default behavior happen
        return;
      } else {
        // Enter to send
        e.preventDefault();
        handleSendMessage();
      }
    }
  }, [handleSendMessage]);

  // Stop typing when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      sendTypingStatus(false);
    };
  }, [conversationId, sendTypingStatus]);

  // Focus textarea when not disabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const canSend = message.trim().length > 0 && !isSending && !disabled;
  const remainingChars = maxLength - message.length;
  const showCharCount = message.length > maxLength * 0.8; // Show when 80% full

  return (
    <div className="bg-white border-t border-instagram-gray-200 p-4">
      <div className="flex items-end gap-3">
        {/* Camera Button */}
        <button
          type="button"
          disabled={disabled}
          className="flex-shrink-0 p-2 text-instagram-gray-500 hover:text-instagram-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Add photo"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Message Input Container */}
        <div className="flex-1 relative">
          <div className="relative bg-instagram-gray-50 rounded-full border border-instagram-gray-200 focus-within:border-instagram-gray-300 transition-colors">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending}
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-transparent border-none outline-none resize-none text-sm placeholder-instagram-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                lineHeight: '20px'
              }}
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              disabled={disabled}
              className="absolute right-3 bottom-3 text-instagram-gray-500 hover:text-instagram-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Add emoji"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Character Count */}
          {showCharCount && (
            <div className="absolute -top-6 right-0">
              <span className={`text-xs ${remainingChars < 50 ? 'text-red-500' : 'text-instagram-gray-400'}`}>
                {remainingChars}
              </span>
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!canSend}
          className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
            canSend
              ? 'bg-instagram-blue text-white hover:bg-instagram-blue-dark shadow-md hover:shadow-lg'
              : 'bg-instagram-gray-200 text-instagram-gray-400 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          {isSending ? (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>

        {/* Voice Message Button (when no text) */}
        {!message.trim() && !isSending && (
          <button
            type="button"
            disabled={disabled}
            className="flex-shrink-0 p-2 text-instagram-gray-500 hover:text-instagram-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Voice message"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
      </div>

      {/* Typing Indicator Space */}
      <div className="h-4 mt-2">
        {/* This space is reserved for typing indicators from other users */}
      </div>
    </div>
  );
}
