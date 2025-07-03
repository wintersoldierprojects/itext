'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { containsLinks } from '@/lib/linkDetection';
import type { Message } from '@/types'; // Assuming you have a Message type

// Define a more specific message type for the hook's internal state if needed
// Base Message type from database.ts:
// id, conversation_id, sender_id, content, message_type, sent_at (string), 
// delivered_at (string | null), read_at (string | null), is_admin, created_at
interface HookMessage extends Omit<Message, 'sent_at'> { 
  sent_at: string | null; // Override to allow null for optimistic 'sending' state
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'; // Client-side only
}

export function useMessages(conversationId: string | null, initialMockMessages?: HookMessage[]) {
  const [messages, setMessages] = useState<HookMessage[]>(initialMockMessages || []);
  const [loading, setLoading] = useState(!initialMockMessages); // Don't set loading if mock messages are provided
  const [error, setError] = useState<Error | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const supabase = createClient();

  // Helper function to calculate message status from database fields
  const calculateMessageStatus = useCallback((message: Message): 'sending' | 'sent' | 'delivered' | 'read' | 'failed' => {
    // If no sent_at, it's still sending (shouldn't happen for fetched messages)
    if (!message.sent_at) return 'sending';
    
    // If read_at exists, message has been read
    if (message.read_at) return 'read';
    
    // If delivered_at exists, message has been delivered
    if (message.delivered_at) return 'delivered';
    
    // If only sent_at exists, message has been sent but not delivered
    return 'sent';
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Calculate status for each message and convert to HookMessage
      const messagesWithStatus: HookMessage[] = (data || []).map(message => ({
        ...message,
        status: calculateMessageStatus(message)
      }));

      setMessages(messagesWithStatus);
    } catch (e:any) {
      setError(e);
      setMessages([]); // Clear messages on error
    } finally {
      setLoading(false);
    }
  }, [conversationId, supabase, calculateMessageStatus]);

  useEffect(() => {
    // Only fetch messages if not using mock and conversationId is present
    if (!initialMockMessages && conversationId) {
      fetchMessages();
    } else if (initialMockMessages) {
      setLoading(false); // Ensure loading is false if using mock
    }
  }, [fetchMessages, conversationId, initialMockMessages]);

  const sendMessage = useCallback(async (content: string, senderId: string, isAdmin: boolean = false) => {
    if (!conversationId || !content.trim()) return;

    // Detect if the message contains links
    const messageType = containsLinks(content) ? 'link' : 'text';

    const tempId = Date.now().toString(); // Temporary ID for optimistic update
    const newMessage: HookMessage = {
      // Properties from Message type
      id: tempId, 
      conversation_id: conversationId,
      sender_id: senderId, 
      content,
      created_at: new Date().toISOString(),
      is_admin: isAdmin,
      message_type: messageType, // Set based on link detection
      read_at: null,        // Initially null
      delivered_at: null,   // Initially null, already string | null in base Message
      
      // Overridden property for HookMessage
      sent_at: null,        // Initially null for 'sending' status
      
      // Client-side only property
      status: 'sending',
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);

    try {
      // Remove client-side status before sending to DB
      // Also remove id because it's a tempId and DB will generate the real one.
      const { status, id: tempClientDbId, ...messageToSend } = newMessage;
      
      const { data: insertedMessage, error: insertError } = await supabase
        .from('messages')
        .insert(messageToSend as Omit<HookMessage, 'status' | 'id'>) // Cast to ensure type safety after omitting
        .select()
        .single();
      
      if (insertError) throw insertError;

      // Update message with server-generated ID and set status to 'sent'
      // This optimistic update should ideally be handled by the real-time subscription
      // to avoid conflicts, but for now, we can update the specific message.
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === tempId ? { ...(insertedMessage as HookMessage), status: 'sent' } : msg
        )
      );
      console.log('Message sent successfully and UI updated:', insertedMessage);

    } catch (e:any) {
      setError(e);
      // Revert optimistic update or mark as failed
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        )
      );
    }
  }, [conversationId, supabase]);

  // Real-time subscription for live message updates
  useEffect(() => {
    // Only set up real-time if not using mock messages and conversationId is present
    if (initialMockMessages || !conversationId) return;

    console.log(`🔄 Setting up real-time subscription for conversation: ${conversationId}`);
    
    // Subscribe to INSERT events for new messages
    const messageSubscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('📨 New message received via subscription:', payload.new);
          const newMessage = payload.new as Message;
          
          // Calculate status for the new message
          const messageWithStatus: HookMessage = {
            ...newMessage,
            status: calculateMessageStatus(newMessage)
          };
          
          // Add the new message to state, avoiding duplicates
          setMessages(prevMessages => {
            // Check if message already exists (avoid duplicates from optimistic updates)
            const exists = prevMessages.some(msg => msg.id === messageWithStatus.id);
            if (exists) {
              console.log('⚠️ Message already exists, skipping duplicate');
              return prevMessages;
            }
            
            // Add new message and sort by created_at to maintain order
            const updatedMessages = [...prevMessages, messageWithStatus].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            console.log('✅ Message added to state via real-time subscription');
            return updatedMessages;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('📝 Message updated via subscription:', payload.new);
          const updatedMessage = payload.new as Message;
          
          // Calculate status for the updated message
          const messageWithStatus: HookMessage = {
            ...updatedMessage,
            status: calculateMessageStatus(updatedMessage)
          };
          
          // Update existing message in state
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === messageWithStatus.id ? messageWithStatus : msg
            )
          );
          
          console.log('✅ Message updated in state via real-time subscription');
        }
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status for conversation ${conversationId}:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time messages');
          setConnectionState('connected');
          setError(null); // Clear any previous errors
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error');
          setConnectionState('error');
          setError(new Error('Real-time connection failed'));
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Real-time subscription timed out');
          setConnectionState('error');
          setError(new Error('Real-time connection timed out'));
        } else if (status === 'CLOSED') {
          console.log('🔌 Real-time subscription closed');
          setConnectionState('disconnected');
        }
      });

    return () => {
      console.log(`🔌 Cleaning up real-time subscription for conversation: ${conversationId}`);
      messageSubscription.unsubscribe();
    };
  }, [conversationId, supabase]);

  // Mark messages as read
  const markAsRead = useCallback(async (currentUserId: string) => {
    if (!conversationId) return;

    try {
      // Find unread messages that are not from the current user
      const unreadMessages = messages.filter(msg => 
        !msg.read_at && msg.sender_id !== currentUserId
      );

      if (unreadMessages.length === 0) return;

      // Update all unread messages to mark them as read
      const messageIds = unreadMessages.map(msg => msg.id);
      
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);

      if (updateError) throw updateError;

      console.log(`✅ Marked ${messageIds.length} messages as read`);
      
      // The real-time subscription will handle updating the UI
      // But we can also optimistically update the local state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          messageIds.includes(msg.id)
            ? { ...msg, read_at: new Date().toISOString(), status: 'read' }
            : msg
        )
      );

    } catch (e: any) {
      console.error('❌ Failed to mark messages as read:', e);
      setError(e);
    }
  }, [conversationId, messages, supabase]);

  // Auto-mark messages as delivered when they're received
  const markAsDelivered = useCallback(async (messageIds: string[]) => {
    if (!conversationId || messageIds.length === 0) return;

    try {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ delivered_at: new Date().toISOString() })
        .in('id', messageIds)
        .is('delivered_at', null); // Only update if not already delivered

      if (updateError) throw updateError;

      console.log(`✅ Marked ${messageIds.length} messages as delivered`);
    } catch (e: any) {
      console.error('❌ Failed to mark messages as delivered:', e);
    }
  }, [conversationId, supabase]);

  // Auto-mark incoming messages as delivered
  useEffect(() => {
    const undeliveredMessages = messages.filter(msg => 
      msg.sent_at && !msg.delivered_at && msg.status === 'sent'
    );

    if (undeliveredMessages.length > 0) {
      const messageIds = undeliveredMessages.map(msg => msg.id);
      markAsDelivered(messageIds);
    }
  }, [messages, markAsDelivered]);

  return { 
    messages, 
    loading, 
    error, 
    connectionState,
    sendMessage, 
    fetchMessages,
    markAsRead
  };
}
