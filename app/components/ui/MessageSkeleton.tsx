'use client';

import React from 'react';
import { Skeleton, AvatarSkeleton, TextSkeleton } from './Skeleton';

interface MessageSkeletonProps {
  isOwn?: boolean;
  showAvatar?: boolean;
  className?: string;
}

export function MessageSkeleton({ 
  isOwn = false, 
  showAvatar = true,
  className = '' 
}: MessageSkeletonProps) {
  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${className}`}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <AvatarSkeleton size="sm" className="flex-shrink-0" />
      )}

      {/* Message bubble */}
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        <div className={`
          p-3 rounded-2xl
          ${isOwn 
            ? 'bg-gray-200 rounded-br-md' 
            : 'bg-gray-200 rounded-bl-md'
          }
        `}>
          <TextSkeleton 
            lines={Math.floor(Math.random() * 3) + 1} 
            lineHeight="h-3"
            lastLineWidth={`${Math.floor(Math.random() * 40) + 40}%`}
          />
        </div>
        
        {/* Message status/timestamp */}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <Skeleton className="h-3 w-12" />
          {isOwn && (
            <Skeleton className="h-3 w-3 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}

// Multiple message skeletons
interface MessageListSkeletonProps {
  count?: number;
  className?: string;
}

export function MessageListSkeleton({ count = 5, className = '' }: MessageListSkeletonProps) {
  return (
    <div className={`space-y-4 p-4 ${className}`}>
      {/* Date separator */}
      <div className="flex justify-center">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Messages */}
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton
          key={index}
          isOwn={Math.random() > 0.5}
          showAvatar={index === 0 || Math.random() > 0.7}
        />
      ))}
    </div>
  );
}

// Typing indicator skeleton
export function TypingIndicatorSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-3 mb-4 ${className}`}>
      <AvatarSkeleton size="sm" className="flex-shrink-0" />
      <div className="bg-gray-200 rounded-2xl rounded-bl-md p-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
}
