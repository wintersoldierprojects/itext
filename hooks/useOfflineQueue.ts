'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface QueuedMessage {
  id: string
  conversationId: string
  content: string
  timestamp: number
  retryCount: number
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(true)
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const supabase = createClient()

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Initial check
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Load queued messages from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cherrygifts-message-queue')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setQueuedMessages(parsed)
      } catch (error) {
        console.error('Error parsing queued messages:', error)
        localStorage.removeItem('cherrygifts-message-queue')
      }
    }
  }, [])

  // Save queued messages to localStorage whenever queue changes
  useEffect(() => {
    if (queuedMessages.length > 0) {
      localStorage.setItem('cherrygifts-message-queue', JSON.stringify(queuedMessages))
    } else {
      localStorage.removeItem('cherrygifts-message-queue')
    }
  }, [queuedMessages])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queuedMessages.length > 0 && !isSyncing) {
      syncQueuedMessages()
    }
  }, [isOnline, queuedMessages.length, isSyncing])

  const addToQueue = useCallback((conversationId: string, content: string) => {
    const queuedMessage: QueuedMessage = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      content,
      timestamp: Date.now(),
      retryCount: 0
    }

    setQueuedMessages(prev => [...prev, queuedMessage])
    return queuedMessage.id
  }, [])

  const removeFromQueue = useCallback((messageId: string) => {
    setQueuedMessages(prev => prev.filter(msg => msg.id !== messageId))
  }, [])

  const syncQueuedMessages = useCallback(async () => {
    if (!isOnline || queuedMessages.length === 0 || isSyncing) return

    setIsSyncing(true)
    const successfulSends: string[] = []
    const failedMessages: QueuedMessage[] = []

    for (const message of queuedMessages) {
      try {
        // Send message to Supabase
        const { error } = await supabase
          .from('messages')
          .insert({
            conversation_id: message.conversationId,
            content: message.content,
            sent_at: new Date(message.timestamp).toISOString()
          })

        if (error) throw error
        successfulSends.push(message.id)
      } catch (error) {
        console.error(`Failed to sync message ${message.id}:`, error)
        
        // Retry logic: max 3 attempts
        if (message.retryCount < 3) {
          failedMessages.push({
            ...message,
            retryCount: message.retryCount + 1
          })
        }
      }
    }

    // Update queue: remove successful sends, keep failed ones for retry
    setQueuedMessages(failedMessages)
    setIsSyncing(false)

    // Show user feedback if needed
    if (successfulSends.length > 0) {
      console.log(`Successfully synced ${successfulSends.length} messages`)
    }
    if (failedMessages.length > 0) {
      console.warn(`${failedMessages.length} messages failed to sync and will retry`)
    }
  }, [isOnline, queuedMessages, isSyncing, supabase])

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!content.trim()) return { success: false, error: 'Message cannot be empty' }

    if (!isOnline) {
      // Add to queue if offline
      const queuedId = addToQueue(conversationId, content)
      return { 
        success: true, 
        messageId: queuedId,
        queued: true 
      }
    }

    try {
      // Send immediately if online
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          sent_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return { 
        success: true, 
        messageId: data.id,
        queued: false 
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      
      // Fallback to queue if immediate send fails
      const queuedId = addToQueue(conversationId, content)
      return { 
        success: true, 
        messageId: queuedId,
        queued: true,
        error: 'Message queued due to connection issue'
      }
    }
  }, [isOnline, addToQueue, supabase])

  return {
    isOnline,
    queuedMessages,
    isSyncing,
    sendMessage,
    syncQueuedMessages,
    addToQueue,
    removeFromQueue
  }
}