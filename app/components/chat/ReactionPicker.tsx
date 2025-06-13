'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ReactionPickerProps {
  isVisible: boolean;
  onReactionSelect: (reaction: string) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

const REACTIONS = [
  { emoji: '❤️', name: 'heart' },
  { emoji: '👍', name: 'thumbs_up' },
  { emoji: '😂', name: 'laugh' },
  { emoji: '😮', name: 'wow' },
  { emoji: '😢', name: 'sad' },
  { emoji: '😡', name: 'angry' }
];

export function ReactionPicker({ 
  isVisible, 
  onReactionSelect, 
  onClose, 
  position = { x: 0, y: 0 } 
}: ReactionPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isVisible) {
      setAnimationClass('animate-scale-in');
    } else {
      setAnimationClass('animate-scale-out');
    }
  }, [isVisible]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  const handleReactionClick = (reaction: string) => {
    onReactionSelect(reaction);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Reaction Picker */}
      <div
        ref={pickerRef}
        className={`fixed z-50 bg-white rounded-full shadow-lg border border-gray-200 p-2 ${animationClass}`}
        style={{
          left: Math.max(10, Math.min(position.x - 150, window.innerWidth - 310)),
          top: Math.max(10, position.y - 60),
          transform: 'translateY(-100%)'
        }}
      >
        <div className="flex items-center gap-1">
          {REACTIONS.map((reaction, index) => (
            <button
              key={reaction.name}
              onClick={() => handleReactionClick(reaction.name)}
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95"
              style={{
                animationDelay: `${index * 50}ms`
              }}
              aria-label={`React with ${reaction.name}`}
            >
              <span className="text-2xl">{reaction.emoji}</span>
            </button>
          ))}
        </div>
        
        {/* Arrow pointing down */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-200 absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-px"></div>
        </div>
      </div>
    </>
  );
}

// Add these animations to your global CSS
export const reactionPickerStyles = `
@keyframes scale-in {
  0% {
    opacity: 0;
    transform: translateY(-100%) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(-100%) scale(1);
  }
}

@keyframes scale-out {
  0% {
    opacity: 1;
    transform: translateY(-100%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-100%) scale(0.8);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out forwards;
}

.animate-scale-out {
  animation: scale-out 0.15s ease-in forwards;
}
`;
