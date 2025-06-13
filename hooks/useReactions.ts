'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

// Simplified Reaction type for this hook
interface MessageReaction {
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

export function useReactions(messageId: string) {
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Fetch reactions for a specific message
  const fetchReactions = useCallback(async () => {
    if (!messageId) return;

    setLoading(true);
    setError(null);
    
    try {
      // First get reactions
      const { data: reactionsData, error: fetchError } = await supabase
        .from('message_reactions')
        .select('id, message_id, user_id, reaction_type, created_at')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Then get user data for each reaction
      const reactionsWithUsers: MessageReaction[] = [];
      
      for (const reaction of reactionsData || []) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, instagram_username, full_name')
          .eq('id', reaction.user_id)
          .single();

        reactionsWithUsers.push({
          ...reaction,
          user: userData || null
        });
      }

      setReactions(reactionsWithUsers);
    } catch (e: any) {
      console.error('Failed to fetch reactions:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [messageId, supabase]);

  // Toggle reaction (add if not exists, remove if exists)
  const toggleReaction = useCallback(async (reactionType: string) => {
    if (!messageId || !reactionType) return;

    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already reacted with this type
      const existingReaction = reactions.find(
        r => r.user_id === user.id && r.reaction_type === reactionType
      );

      if (existingReaction) {
        // Remove existing reaction
        const { error: deleteError } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) throw deleteError;

        // Update local state
        setReactions(prev => prev.filter(r => r.id !== existingReaction.id));
        console.log('Reaction removed:', existingReaction);
      } else {
        // Add new reaction
        const { data, error: insertError } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction_type: reactionType,
          })
          .select('id, message_id, user_id, reaction_type, created_at')
          .single();

        if (insertError) throw insertError;

        // Get user data
        const { data: userData } = await supabase
          .from('users')
          .select('id, instagram_username, full_name')
          .eq('id', user.id)
          .single();

        // Update local state
        const newReaction: MessageReaction = {
          ...data,
          user: userData || null
        };
        
        setReactions(prev => [...prev, newReaction]);
        console.log('Reaction added:', newReaction);
      }
    } catch (e: any) {
      console.error('Failed to toggle reaction:', e);
      setError(e);
    }
  }, [messageId, reactions, supabase]);

  // Add reaction (always adds, doesn't check for existing)
  const addReaction = useCallback(async (reactionType: string) => {
    if (!messageId || !reactionType) return;

    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType,
        })
        .select('id, message_id, user_id, reaction_type, created_at')
        .single();

      if (insertError) throw insertError;

      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('id, instagram_username, full_name')
        .eq('id', user.id)
        .single();

      // Update local state
      const newReaction: MessageReaction = {
        ...data,
        user: userData || null
      };
      
      setReactions(prev => [...prev, newReaction]);
      console.log('Reaction added:', newReaction);
    } catch (e: any) {
      console.error('Failed to add reaction:', e);
      setError(e);
    }
  }, [messageId, supabase]);

  // Remove specific reaction
  const removeReaction = useCallback(async (reactionId: string) => {
    if (!reactionId) return;

    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', reactionId);

      if (deleteError) throw deleteError;

      // Update local state
      setReactions(prev => prev.filter(r => r.id !== reactionId));
      console.log('Reaction removed:', reactionId);
    } catch (e: any) {
      console.error('Failed to remove reaction:', e);
      setError(e);
    }
  }, [supabase]);

  // Fetch reactions on mount and when messageId changes
  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  // Set up real-time subscription for reactions
  useEffect(() => {
    if (!messageId) return;

    const channel = supabase
      .channel(`reactions:${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`,
        },
        (payload) => {
          console.log('Reaction change:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Add new reaction to state
            fetchReactions(); // Refetch to get user data
          } else if (payload.eventType === 'DELETE') {
            // Remove reaction from state
            setReactions(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId, supabase, fetchReactions]);

  return {
    reactions,
    loading,
    error,
    addReaction,
    removeReaction,
    toggleReaction,
    refetch: fetchReactions,
  };
}
