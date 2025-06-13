'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { TimeFormat } from '@/lib/timeUtils';
import { useInfiniteScroll } from '@/hooks/usePagination';
import type { MessageWithStatus } from '@/types';

interface MessageListProps {
  messages: MessageWithStatus[];
  loading: boolean;
  currentUserId: string;
  onMessageLongPress?: (messageId: string) => void;
}

export function MessageList({ 
  messages, 
  loading, 
  currentUserId,
  onMessageLongPress 
}: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const lastMessageCountRef = useRef(messages.length);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, []);

  // Check if user is near bottom of scroll
  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Consider "near bottom" if within 100px
    const isNearBottom = distanceFromBottom < 100;
    setShouldAutoScroll(isNearBottom);
    setShowScrollToBottom(!isNearBottom && messages.length > 0);
  }, [messages.length]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    checkScrollPosition();
  }, [checkScrollPosition]);

  // Auto-scroll when new messages arrive (if user is near bottom)
  useEffect(() => {
    const newMessageCount = messages.length;
    const hasNewMessages = newMessageCount > lastMessageCountRef.current;
    
    if (hasNewMessages && shouldAutoScroll) {
      // Small delay to ensure DOM is updated
      setTimeout(() => scrollToBottom(true), 50);
    }
    
    lastMessageCountRef.current = newMessageCount;
  }, [messages.length, shouldAutoScroll, scrollToBottom]);

  // Initial scroll to bottom when component mounts
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [scrollToBottom]);

  // Group messages by date for date separators
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: MessageWithStatus[] }[] = [];
    let currentDate = '';
    let currentGroup: MessageWithStatus[] = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.created_at).toDateString();
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  }, [messages]);

  // Format date for separator
  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-instagram-blue mx-auto mb-4"></div>
          <p className="text-sm text-instagram-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-instagram-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-instagram-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-instagram-black mb-2">No messages yet</h3>
          <p className="text-sm text-instagram-gray-500">Start the conversation with a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative bg-white">
      {/* Messages Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-4 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        {groupedMessages.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`}>
            {/* Date Separator */}
            <div className="flex justify-center my-4">
              <div className="bg-instagram-gray-100 px-3 py-1 rounded-full">
                <span className="text-xs text-instagram-gray-500 font-medium">
                  {formatDateSeparator(group.date)}
                </span>
              </div>
            </div>

            {/* Messages for this date */}
            {group.messages.map((message, messageIndex) => {
              const isConsecutive = messageIndex > 0 && 
                group.messages[messageIndex - 1].sender_id === message.sender_id &&
                new Date(message.created_at).getTime() - new Date(group.messages[messageIndex - 1].created_at).getTime() < 60000; // Within 1 minute

              return (
                <div
                  key={message.id}
                  className={`mb-2 ${isConsecutive ? 'mb-1' : 'mb-3'}`}
                >
                  <MessageBubble
                    message={message}
                    isOwn={message.sender_id === currentUserId}
                    showTimestamp={!isConsecutive}
                  />
                </div>
              );
            })}
          </div>
        ))}

        {/* Loading indicator for new messages */}
        {loading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-instagram-blue"></div>
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollToBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-4 right-4 bg-white border border-instagram-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
          aria-label="Scroll to bottom"
        >
          <svg className="w-5 h-5 text-instagram-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
}
