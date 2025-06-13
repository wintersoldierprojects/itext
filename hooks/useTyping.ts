'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TypingStatus {
  user_id: string;
  is_typing: boolean;
  username?: string; // Optional: display username in typing indicator
}

// Map to store typing status of users in a conversation
// Key: user_id, Value: is_typing (boolean)
type ConversationTypingStatus = Map<string, boolean>;

export function useTyping(conversationId: string | null, currentUserId: string) {
  const [typingUsers, setTypingUsers] = useState<ConversationTypingStatus>(new Map());
  const supabase = createClient();
  const channelName = `typing-${conversationId}`;
  let typingChannel: RealtimeChannel | null = null;

  // Broadcast typing status
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!conversationId || !typingChannel) return;

    const payload: TypingStatus = {
      user_id: currentUserId,
      is_typing: isTyping,
      // username: currentUsername // If you have access to current user's name
    };

    typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload,
    });
  }, [conversationId, currentUserId, typingChannel]);

  useEffect(() => {
    if (!conversationId) {
      if (typingChannel) {
        supabase.removeChannel(typingChannel);
        typingChannel = null;
      }
      setTypingUsers(new Map());
      return;
    }

    typingChannel = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: false, // Do not receive own broadcasts
        },
      },
    });

    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: TypingStatus }) => {
        setTypingUsers(prev => {
          const newStatus = new Map(prev);
          if (payload.is_typing) {
            newStatus.set(payload.user_id, true);
          } else {
            newStatus.delete(payload.user_id);
          }
          return newStatus;
        });
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to typing channel: ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to typing channel: ${channelName}`);
        }
      });

    return () => {
      if (typingChannel) {
        supabase.removeChannel(typingChannel).then(() => {
          console.log(`Unsubscribed from typing channel: ${channelName}`);
          typingChannel = null;
        });
      }
    };
  }, [conversationId, supabase, channelName]); // Added channelName to dependencies

  // Filter out the current user from the list of typing users
  const otherTypingUsers = new Map(typingUsers);
  otherTypingUsers.delete(currentUserId);

  return {
    typingUsers: otherTypingUsers, // Expose only users other than current
    sendTypingStatus,
  };
}
