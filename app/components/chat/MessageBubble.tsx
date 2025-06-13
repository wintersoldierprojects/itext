'use client'

import { forwardRef, useState, useRef, useCallback } from 'react'
import { MessageStatus } from './MessageStatus'
import { ReactionPicker } from './ReactionPicker'
import { ReactionDisplay } from './ReactionDisplay'
import { useReactions } from '@/hooks/useReactions'
import { parseTextWithLinks, createSafeLink } from '@/lib/linkDetection'
import { TimeFormat } from '@/lib/timeUtils'
import type { MessageWithStatus } from '@/types'

interface MessageBubbleProps {
  message: MessageWithStatus
  isOwn: boolean
  showStatus?: boolean
  showTimestamp?: boolean
  showReactions?: boolean
  className?: string
  onReaction?: (messageId: string, reaction: string) => void
}

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ message, isOwn, showStatus = true, showTimestamp: _showTimestamp = true, showReactions = true, className = '' }, ref) => {
    // Reaction state
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [reactionPickerPosition, setReactionPickerPosition] = useState({ x: 0, y: 0 });
    const messageRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const { reactions, toggleReaction } = useReactions(message.id);

    // Get message status from the status field (calculated in useMessages hook)
    const messageStatus = message.status || 'sent';
    const statusTimestamp = message.read_at || message.delivered_at || message.sent_at || message.created_at;

    // Long-press detection handlers
    const handleMouseDown = useCallback((event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setReactionPickerPosition({
        x: event.clientX,
        y: rect.top
      });

      longPressTimer.current = setTimeout(() => {
        setShowReactionPicker(true);
      }, 500); // 500ms long press
    }, []);

    const handleMouseUp = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }, []);

    const handleTouchStart = useCallback((event: React.TouchEvent) => {
      const touch = event.touches[0];
      const rect = event.currentTarget.getBoundingClientRect();
      setReactionPickerPosition({
        x: touch.clientX,
        y: rect.top
      });

      longPressTimer.current = setTimeout(() => {
        setShowReactionPicker(true);
      }, 500); // 500ms long press
    }, []);

    const handleTouchEnd = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }, []);

    // Reaction handlers
    const handleReactionSelect = useCallback((reactionType: string) => {
      toggleReaction(reactionType);
      setShowReactionPicker(false);
    }, [toggleReaction]);

    const handleReactionClick = useCallback((reactionType: string) => {
      toggleReaction(reactionType);
    }, [toggleReaction]);

    const handleCloseReactionPicker = useCallback(() => {
      setShowReactionPicker(false);
    }, []);

    // Parse message content to handle links
    const textSegments = parseTextWithLinks(message.content);

    // Render message content with clickable links
    const renderMessageContent = () => {
      if (textSegments.length === 1 && textSegments[0].type === 'text') {
        // Simple text message
        return message.content;
      }

      // Message with links
      return textSegments.map((segment, index) => {
        if (segment.type === 'link' && segment.url) {
          const safeLink = createSafeLink(segment.url);
          return (
            <a
              key={index}
              href={safeLink.href}
              target={safeLink.target}
              rel={safeLink.rel}
              className="text-instagram-blue underline hover:text-instagram-blue-dark transition-colors"
              style={{ color: isOwn ? '#B2DFFC' : '#1379f5' }}
            >
              {segment.content}
            </a>
          );
        }
        return segment.content;
      });
    };

    if (isOwn) {
      // User messages (right side) - Keep blue for user messages
      return (
        <div ref={ref} className={`flex items-end gap-3 p-4 justify-end animate-message-slide-in ${className}`}>
          <div className="flex flex-1 flex-col gap-1 items-end">
            <p className="text-instagram-gray-400 text-[13px] font-normal leading-normal max-w-[360px] text-right">
              {message.sender?.instagram_username || 'You'}
            </p>
            <div className="relative">
              <div 
                ref={messageRef}
                className="bg-instagram-blue text-white rounded-[18px] rounded-br-[4px] px-4 py-3 max-w-[360px] shadow-sm cursor-pointer select-none"
                title={TimeFormat.tooltip(message.created_at)}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <p className="text-sm font-normal leading-normal break-words whitespace-pre-wrap">
                  {renderMessageContent()}
                </p>
                {_showTimestamp && (
                  <div className="text-xs text-white/70 mt-1 text-right">
                    {TimeFormat.message(message.created_at)}
                  </div>
                )}
              </div>
              
              {/* Reaction Display */}
              {showReactions && reactions.length > 0 && (
                <div className="mt-1 flex justify-end">
                  <ReactionDisplay
                    reactions={reactions}
                    onReactionClick={handleReactionClick}
                    currentUserId={message.sender_id}
                  />
                </div>
              )}
            </div>
            {showStatus && (
              <div className="text-right mt-1">
                <MessageStatus 
                  status={messageStatus} 
                  timestamp={statusTimestamp} 
                  showTimestamp={false}
                />
              </div>
            )}
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
            <div className="w-full h-full bg-instagram-gray-300 flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {message.sender?.instagram_username?.charAt(0).toUpperCase() || 'Y'}
              </span>
            </div>
          </div>
          
          {/* Reaction Picker */}
          <ReactionPicker
            isVisible={showReactionPicker}
            onReactionSelect={handleReactionSelect}
            onClose={handleCloseReactionPicker}
            position={reactionPickerPosition}
          />
        </div>
      )
    } else {
      // Admin messages (left side) - Use #EFEFEF background as per Task 7
      return (
        <div ref={ref} className={`flex items-end gap-3 p-4 animate-message-slide-in ${className}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
            <div className="w-full h-full bg-instagram-gray-300 flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {message.sender?.instagram_username?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1 items-start">
            <p className="text-instagram-gray-400 text-[13px] font-normal leading-normal max-w-[360px]">
              {message.sender?.instagram_username || 'Admin'}
            </p>
            <div className="relative">
              <div 
                ref={messageRef}
                className="rounded-[18px] rounded-bl-[4px] px-4 py-3 max-w-[360px] shadow-sm cursor-pointer select-none" 
                style={{ backgroundColor: '#EFEFEF' }}
                title={TimeFormat.tooltip(message.created_at)}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <p className="text-sm font-normal leading-normal break-words whitespace-pre-wrap text-black">
                  {renderMessageContent()}
                </p>
                {_showTimestamp && (
                  <div className="text-xs text-gray-500 mt-1">
                    {TimeFormat.message(message.created_at)}
                  </div>
                )}
              </div>
              
              {/* Reaction Display */}
              {showReactions && reactions.length > 0 && (
                <div className="mt-1 flex justify-start">
                  <ReactionDisplay
                    reactions={reactions}
                    onReactionClick={handleReactionClick}
                    currentUserId={message.sender_id}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Reaction Picker */}
          <ReactionPicker
            isVisible={showReactionPicker}
            onReactionSelect={handleReactionSelect}
            onClose={handleCloseReactionPicker}
            position={reactionPickerPosition}
          />
        </div>
      )
    }
  }
)

MessageBubble.displayName = 'MessageBubble'
