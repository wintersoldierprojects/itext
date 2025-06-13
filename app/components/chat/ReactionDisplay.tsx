'use client';

import React from 'react';

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
  user?: {
    id: string;
    instagram_username?: string;
    full_name?: string;
  } | null;
}

interface ReactionDisplayProps {
  reactions: Reaction[];
  onReactionClick?: (reactionType: string) => void;
  currentUserId?: string | null;
}

const REACTION_EMOJIS: Record<string, string> = {
  heart: '❤️',
  thumbs_up: '👍',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡'
};

export function ReactionDisplay({ reactions, onReactionClick, currentUserId }: ReactionDisplayProps) {
  if (!reactions || reactions.length === 0) {
    return null;
  }

  // Group reactions by type and count them
  const groupedReactions = reactions.reduce((acc, reaction) => {
    const type = reaction.reaction_type;
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        users: [],
        hasCurrentUser: false
      };
    }
    acc[type].count++;
    acc[type].users.push(reaction.user?.instagram_username || reaction.user?.full_name || 'Unknown');
    if (reaction.user_id === currentUserId) {
      acc[type].hasCurrentUser = true;
    }
    return acc;
  }, {} as Record<string, { count: number; users: string[]; hasCurrentUser: boolean }>);

  const handleReactionClick = (reactionType: string) => {
    if (onReactionClick) {
      onReactionClick(reactionType);
    }
  };

  const formatTooltip = (users: string[], count: number) => {
    if (count === 1) {
      return users[0];
    } else if (count === 2) {
      return `${users[0]} and ${users[1]}`;
    } else if (count === 3) {
      return `${users[0]}, ${users[1]} and ${users[2]}`;
    } else {
      return `${users[0]}, ${users[1]} and ${count - 2} others`;
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(groupedReactions).map(([reactionType, data]) => {
        const emoji = REACTION_EMOJIS[reactionType] || '👍';
        const isCurrentUserReacted = data.hasCurrentUser;
        
        return (
          <button
            key={reactionType}
            onClick={() => handleReactionClick(reactionType)}
            className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              transition-all duration-200 hover:scale-105 active:scale-95
              ${isCurrentUserReacted 
                ? 'bg-instagram-blue text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title={formatTooltip(data.users, data.count)}
          >
            <span className="text-sm">{emoji}</span>
            {data.count > 1 && (
              <span className="text-xs font-semibold">{data.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Utility function to get reaction emoji
export function getReactionEmoji(reactionType: string): string {
  return REACTION_EMOJIS[reactionType] || '👍';
}

// Utility function to get all available reactions
export function getAvailableReactions() {
  return Object.entries(REACTION_EMOJIS).map(([name, emoji]) => ({
    name,
    emoji
  }));
}
