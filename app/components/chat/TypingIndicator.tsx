'use client'

import { useState, useEffect } from 'react'

interface TypingUser {
  user_id: string;
  username?: string;
  profilePictureUrl?: string;
}

interface TypingIndicatorProps {
  typingUsers: Map<string, boolean>;
  userDetails?: Map<string, TypingUser>;
  className?: string;
  autoHideTimeout?: number;
}

export function TypingIndicator({ 
  typingUsers, 
  userDetails = new Map(),
  className = '',
  autoHideTimeout = 10000 // 10 seconds
}: TypingIndicatorProps) {
  const [visible, setVisible] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Convert Map to array of typing users
  const typingUserIds = Array.from(typingUsers.keys()).filter(userId => typingUsers.get(userId));

  // Auto-hide after timeout
  useEffect(() => {
    if (typingUserIds.length > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, autoHideTimeout);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [typingUserIds.length, autoHideTimeout]);

  const handleImageError = (userId: string) => {
    setImageErrors(prev => new Set([...prev, userId]));
  };

  if (!visible || typingUserIds.length === 0) return null;

  // Format typing message based on number of users
  const getTypingMessage = () => {
    const usernames = typingUserIds.map(userId => {
      const user = userDetails.get(userId);
      return user?.username || 'Someone';
    });

    if (usernames.length === 1) {
      return `${usernames[0]} is typing`;
    } else if (usernames.length === 2) {
      return `${usernames[0]} and ${usernames[1]} are typing`;
    } else if (usernames.length === 3) {
      return `${usernames[0]}, ${usernames[1]} and ${usernames[2]} are typing`;
    } else {
      return `${usernames[0]}, ${usernames[1]} and ${usernames.length - 2} others are typing`;
    }
  };

  // Get primary user for avatar display
  const primaryUserId = typingUserIds[0];
  const primaryUser = userDetails.get(primaryUserId);
  const hasImageError = imageErrors.has(primaryUserId);

  return (
    <div className={`flex items-end gap-3 px-4 py-2 animate-fade-in ${className}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
        {primaryUser?.profilePictureUrl && !hasImageError ? (
          <img
            src={primaryUser.profilePictureUrl}
            alt={primaryUser.username || 'User'}
            className="w-full h-full object-cover"
            onError={() => handleImageError(primaryUserId)}
          />
        ) : (
          <div className="w-full h-full bg-instagram-gray-300 flex items-center justify-center">
            <span className="text-white font-semibold text-xs">
              {(primaryUser?.username || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      {/* Typing Message */}
      <div className="flex flex-1 flex-col gap-1 items-start">
        <div className="bg-instagram-gray-100 text-instagram-black rounded-lg px-3 py-2 max-w-[300px]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-instagram-gray-500">
              {getTypingMessage()}
            </span>
            <div className="flex gap-1">
              <div 
                className="w-1.5 h-1.5 bg-instagram-gray-400 rounded-full animate-typing-dots"
                style={{ animationDelay: '0ms' }}
              ></div>
              <div 
                className="w-1.5 h-1.5 bg-instagram-gray-400 rounded-full animate-typing-dots"
                style={{ animationDelay: '200ms' }}
              ></div>
              <div 
                className="w-1.5 h-1.5 bg-instagram-gray-400 rounded-full animate-typing-dots"
                style={{ animationDelay: '400ms' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Multiple users indicator */}
      {typingUserIds.length > 1 && (
        <div className="flex -space-x-2">
          {typingUserIds.slice(1, 4).map((userId, index) => {
            const user = userDetails.get(userId);
            const hasError = imageErrors.has(userId);
            
            return (
              <div 
                key={userId}
                className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-instagram-gray-300"
                style={{ zIndex: 10 - index }}
              >
                {user?.profilePictureUrl && !hasError ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.username || 'User'}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(userId)}
                  />
                ) : (
                  <div className="w-full h-full bg-instagram-gray-400 flex items-center justify-center">
                    <span className="text-white font-semibold text-xs">
                      {(user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Show count if more than 4 users */}
          {typingUserIds.length > 4 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-instagram-gray-500 flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                +{typingUserIds.length - 4}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
