'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type {
  ConversationListItem,
  AppError,
  UseConversationsReturn,
  RealtimeConversationPayload,
  User
} from '@/types'

interface ConversationQueryResult {
  id: string
  last_message_at: string | null
  last_message_content: string | null
  unread_count: number
  is_active: boolean
  user: User | null
  admin: User | null
}

export function useConversations(userRole: 'user' | 'admin' = 'admin'): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)
  const supabase = createClient()
  const subscriptionRef = useRef<any>(null)

  const loadConversations = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          id,
          last_message_at,
          last_message_content,
          unread_count,
          is_active,
          user:user_id (
            id,
            instagram_username,
            full_name,
            profile_picture_url,
            is_online,
            last_seen
          ),
          admin:admin_id (
            id,
            full_name,
            email,
            is_online
          )
        `)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false, nullsFirst: false })

      if (fetchError) throw fetchError

      const formattedConversations: ConversationListItem[] =
        (data as ConversationQueryResult[] | null)?.map(conv => ({
          id: conv.id,
          user: conv.user,
          admin: conv.admin,
          last_message_content: conv.last_message_content,
          last_message_at: conv.last_message_at,
          unread_count: conv.unread_count,
          is_active: conv.is_active
        })) || []

      setConversations(formattedConversations)
    } catch (err) {
      const appError: AppError = {
        code: 'FETCH_CONVERSATIONS_ERROR',
        message: 'Failed to load conversations',
        details: err
      }
      setError(appError)
      console.error('Error loading conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createConversation = useCallback(async (userId: string): Promise<string> => {
    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (existingConv) {
        return existingConv.id
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          is_active: true
        })
        .select('id')
        .single()

      if (error) throw error

      // Refresh conversations list
      await loadConversations()

      return data.id
    } catch (err) {
      console.error('Error creating conversation:', err)
      throw new Error('Failed to create conversation')
    }
  }, [supabase, loadConversations])

  const refreshConversations = useCallback(async () => {
    await loadConversations()
  }, [loadConversations])

  // Set up real-time subscription
  useEffect(() => {
    // Initial load
    loadConversations()

    // Set up real-time subscription for conversations
    const channel = supabase
      .channel('conversations')
      .on<RealtimeConversationPayload>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            // Refresh conversations when new one is created
            loadConversations()
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            // Update existing conversation
            const newConversation = payload.new
            setConversations(prev => {
              const updated = prev.map(conv => {
                if (conv.id === newConversation.id) {
                  return {
                    ...conv,
                    last_message_at: newConversation.last_message_at,
                    last_message_content: newConversation.last_message_content,
                    unread_count: newConversation.unread_count
                  }
                }
                return conv
              })

              // Sort by last_message_at
              return updated.sort((a, b) => {
                if (!a.last_message_at) return 1
                if (!b.last_message_at) return -1
                return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
              })
            })
          }
        }
      )
      .subscribe()

    subscriptionRef.current = channel

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [supabase, loadConversations])

  return {
    conversations,
    loading,
    error,
    createConversation,
    refreshConversations
  }
}