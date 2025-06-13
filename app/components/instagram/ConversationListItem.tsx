'use client'

import { useState } from 'react'
import type { ConversationWithUser } from '@/types'
import { useTouchInteractions } from '@/hooks/useTouchInteractions'
import { OnlineIndicator, useStatusText } from '@/app/components/ui/OnlineIndicator'

interface ConversationListItemProps {
  conversation: ConversationWithUser
  isActive?: boolean
  onClick?: () => void
}

export default function ConversationListItem({ 
  conversation, 
  isActive = false, 
  onClick 
}: ConversationListItemProps) {
  const [imageError, setImageError] = useState(false)
  const [showActions, setShowActions] = useState(false)
  
  const { touchHandlers, isTouching } = useTouchInteractions({
    onSwipeLeft: () => setShowActions(true),
    onSwipeRight: () => setShowActions(false),
    onDoubleTap: onClick,
    swipeThreshold: 30
  })
  
  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''
    
    const now = new Date()
    const messageTime = new Date(dateString)
    const diffInMs = now.getTime() - messageTime.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInWeeks = Math.floor(diffInDays / 7)
    const diffInMonths = Math.floor(diffInDays / 30)
    
    if (diffInDays === 0) {
      return messageTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInDays === 1) {
      return '1d'
    } else if (diffInDays < 7) {
      return `${diffInDays}d`
    } else if (diffInWeeks === 1) {
      return '1w'
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks}w`
    } else if (diffInMonths === 1) {
      return '1mo'
    } else {
      return `${diffInMonths}mo`
    }
  }

  const getInitials = (username?: string) => {
    if (!username) return '?'
    return username.charAt(0).toUpperCase()
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="relative overflow-hidden">
      <div 
        className={`
          flex items-center gap-3 bg-white px-4 min-h-[72px] py-3 justify-between cursor-pointer
          hover:bg-gray-50 transition-all duration-150
          ${isActive ? 'bg-gray-50' : ''}
          ${isTouching ? 'scale-[0.98] opacity-90' : ''}
          ${showActions ? '-translate-x-20' : 'translate-x-0'}
        `}
        onClick={onClick}
        {...touchHandlers}
      >
      <div className="flex items-center gap-4">
        <div className="relative">
          {conversation.user?.profile_picture_url && !imageError ? (
            <img
              src={conversation.user.profile_picture_url}
              alt={conversation.user.instagram_username || 'User'}
              className="w-14 h-14 rounded-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14 bg-instagram-gray-300 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {getInitials(conversation.user?.instagram_username || '')}
              </span>
            </div>
          )}
          {/* Online Status Indicator */}
          <div className="absolute -bottom-1 -right-1">
            <OnlineIndicator
              isOnline={conversation.user?.is_online || false}
              lastSeen={conversation.user?.last_seen}
              size="md"
            />
          </div>
        </div>
        
        <div className="flex flex-col justify-center">
          <p className={`text-instagram-black text-base font-medium leading-normal line-clamp-1 ${
            conversation.unread_count > 0 ? 'font-bold' : ''
          }`}>
            {conversation.user?.instagram_username || 'Unknown'}
          </p>
          <p className={`text-instagram-gray-400 text-sm font-normal leading-normal line-clamp-2 ${
            conversation.unread_count > 0 ? 'font-semibold text-instagram-black' : ''
          }`}>
            {conversation.last_message_content || 'No messages yet'}
          </p>
        </div>
      </div>
      
      <div className="shrink-0 flex flex-col items-end gap-1">
        <p className="text-instagram-gray-400 text-sm font-normal leading-normal">
          {formatTime(conversation.last_message_at)}
        </p>
        {conversation.unread_count > 0 && (
          <div className="bg-instagram-blue text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
          </div>
        )}
      </div>
      
      {/* Swipe Actions */}
      <div className="absolute right-0 top-0 h-full flex items-center pr-4">
        <button className="bg-instagram-red text-white px-4 py-2 rounded-lg text-sm font-medium">
          Delete
        </button>
      </div>
    </div>
    </div>
  )
}
