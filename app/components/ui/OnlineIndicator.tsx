'use client';

import React from 'react';
import { TimeFormat } from '@/lib/timeUtils';

interface OnlineIndicatorProps {
  isOnline: boolean;
  lastSeen?: string | null;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OnlineIndicator({ 
  isOnline, 
  lastSeen, 
  showText = false, 
  size = 'md',
  className = '' 
}: OnlineIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getStatusText = () => {
    if (isOnline) {
      return 'Active now';
    } else if (lastSeen) {
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffInMs = now.getTime() - lastSeenDate.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) {
        return 'Active now';
      } else if (diffInMinutes < 60) {
        return `Active ${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `Active ${diffInHours}h ago`;
      } else if (diffInDays === 1) {
        return 'Active yesterday';
      } else if (diffInDays < 7) {
        return `Active ${diffInDays}d ago`;
      } else {
        return `Last seen ${TimeFormat.relative(lastSeen)}`;
      }
    } else {
      return 'Offline';
    }
  };

  if (showText) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative">
          <div 
            className={`${sizeClasses[size]} rounded-full transition-colors duration-200 ${
              isOnline 
                ? 'bg-green-500 shadow-sm' 
                : 'bg-gray-300'
            }`}
          />
          {isOnline && (
            <div 
              className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 animate-ping opacity-75`}
            />
          )}
        </div>
        <span className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} title={getStatusText()}>
      <div 
        className={`${sizeClasses[size]} rounded-full transition-colors duration-200 ${
          isOnline 
            ? 'bg-green-500 shadow-sm border-2 border-white' 
            : 'bg-gray-300 border-2 border-white'
        }`}
      />
      {isOnline && (
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 animate-ping opacity-75`}
        />
      )}
    </div>
  );
}

// Utility component for avatar with online status
interface AvatarWithStatusProps {
  src?: string;
  alt?: string;
  username?: string;
  isOnline: boolean;
  lastSeen?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarWithStatus({
  src,
  alt,
  username,
  isOnline,
  lastSeen,
  size = 'md',
  className = ''
}: AvatarWithStatusProps) {
  const avatarSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const indicatorSizes = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg'
  } as const;

  const indicatorPositions = {
    sm: 'bottom-0 right-0',
    md: 'bottom-0 right-0',
    lg: 'bottom-0.5 right-0.5',
    xl: 'bottom-1 right-1'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${avatarSizes[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center`}>
        {src ? (
          <img 
            src={src} 
            alt={alt || username || 'User avatar'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500 font-semibold text-sm">
            {username?.charAt(0).toUpperCase() || '?'}
          </span>
        )}
      </div>
      
      {/* Online Status Indicator */}
      <div className={`absolute ${indicatorPositions[size]}`}>
        <OnlineIndicator 
          isOnline={isOnline} 
          lastSeen={lastSeen} 
          size={indicatorSizes[size]}
        />
      </div>
    </div>
  );
}

// Hook for getting user status text
export function useStatusText(isOnline: boolean, lastSeen?: string | null) {
  if (isOnline) {
    return 'Active now';
  } else if (lastSeen) {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMs = now.getTime() - lastSeenDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Active now';
    } else if (diffInMinutes < 60) {
      return `Active ${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `Active ${diffInHours}h ago`;
    } else if (diffInDays === 1) {
      return 'Active yesterday';
    } else if (diffInDays < 7) {
      return `Active ${diffInDays}d ago`;
    } else {
      return `Last seen ${TimeFormat.relative(lastSeen)}`;
    }
  } else {
    return 'Offline';
  }
}
