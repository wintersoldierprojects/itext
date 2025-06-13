'use client'

import { useState, useRef, useEffect } from 'react'
import { HeartIcon } from '@heroicons/react/24/solid'
import { createClient } from '@/lib/supabase'

interface MessageReactionProps {
  messageId: string
  onReaction?: (messageId: string, reaction: string) => void
  children: React.ReactNode
  disabled?: boolean
  reactions?: ReactionCount[]
}

interface ReactionCount {
  reaction_type: string
  count: number
  user_reacted: boolean
}

const REACTION_EMOJIS = {
  heart: '❤️',
  like: '👍',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡'
}

export type { ReactionCount }

export default function MessageReaction({
  messageId,
  onReaction,
  children,
  disabled = false,
  reactions = []
}: MessageReactionProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [showHeartAnimation, setShowHeartAnimation] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const heartTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const supabase = createClient()!
  
  const handleTouchStart = (_e: React.TouchEvent) => {
    if (disabled) return
    
    // Start long press timer for reaction picker
    const timer = setTimeout(() => {
      setShowReactionPicker(true)
    }, 500)
    setLongPressTimer(timer)
  }
  
  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }
  
  const handleClick = () => {
    if (disabled) return
    
    const now = Date.now()
    const timeDiff = now - lastTap
    
    if (timeDiff < 300 && timeDiff > 0) {
      // Double tap detected - quick heart reaction
      handleReaction('heart')
      setShowHeartAnimation(true)
      
      // Clear any existing timeout
      if (heartTimeoutRef.current) {
        clearTimeout(heartTimeoutRef.current)
      }
      
      // Hide heart after animation
      heartTimeoutRef.current = setTimeout(() => {
        setShowHeartAnimation(false)
      }, 1000)
      
      setLastTap(0) // Reset to prevent triple tap
    } else {
      setLastTap(now)
    }
  }
  
  const handleReaction = async (reactionType: string) => {
    try {
      const { data: _data, error } = await supabase.rpc('toggle_reaction', {
        p_message_id: messageId,
        p_reaction_type: reactionType
      })
      
      if (error) {
        console.error('Error toggling reaction:', error)
        return
      }
      
      onReaction?.(messageId, reactionType)
      setShowReactionPicker(false)
    } catch (error) {
      console.error('Error in handleReaction:', error)
    }
  }
  
  const handleReactionPickerClick = (reactionType: string) => {
    handleReaction(reactionType)
  }
  
  useEffect(() => {
    const handleClickOutside = () => {
      setShowReactionPicker(false)
    }
    
    if (showReactionPicker) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showReactionPicker])

  return (
    <div className="relative select-none">
      <div 
        className="cursor-pointer"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault()
          if (!disabled) setShowReactionPicker(true)
        }}
      >
        {children}
      </div>
      
      {/* Heart animation overlay */}
      {showHeartAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="animate-heart-beat">
            <HeartIcon className="w-8 h-8 text-red-500 drop-shadow-lg" />
          </div>
        </div>
      )}
      
      {/* Reaction picker */}
      {showReactionPicker && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-full shadow-lg border border-gray-200 p-2 flex gap-1">
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
              <button
                key={type}
                onClick={() => handleReactionPickerClick(type)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg transition-all duration-200 hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Reaction counts */}
      {reactions.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {reactions.map((reaction) => (
            <button
              key={reaction.reaction_type}
              onClick={() => handleReaction(reaction.reaction_type)}
              className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                transition-all duration-200 hover:scale-105
                ${reaction.user_reacted 
                  ? 'bg-instagram-blue text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span>{REACTION_EMOJIS[reaction.reaction_type as keyof typeof REACTION_EMOJIS]}</span>
              {reaction.count > 1 && <span>{reaction.count}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
