'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
}

interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  })
  const [isSupported, setIsSupported] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      setIsSupported(true)
      updatePermissionState()
    }
  }, [])

  const updatePermissionState = () => {
    if (!('Notification' in window)) return

    const currentPermission = Notification.permission
    setPermission({
      granted: currentPermission === 'granted',
      denied: currentPermission === 'denied',
      default: currentPermission === 'default'
    })
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      const result = await Notification.requestPermission()
      updatePermissionState()
      return result === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  const showNotification = useCallback(async (options: NotificationOptions): Promise<boolean> => {
    if (!isSupported || !permission.granted) {
      console.warn('Notifications not supported or permission not granted')
      return false
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/icon-72x72.png',
        tag: options.tag || 'cherrygifts-message',
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        data: {
          timestamp: Date.now(),
          url: window.location.origin
        }
      })

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      // Handle notification click
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return true
    } catch (error) {
      console.error('Error showing notification:', error)
      return false
    }
  }, [isSupported, permission.granted])

  const notifyNewMessage = useCallback(async (
    senderName: string, 
    messageContent: string,
    conversationId?: string
  ) => {
    return showNotification({
      title: `New message from ${senderName}`,
      body: messageContent.length > 50 
        ? messageContent.substring(0, 50) + '...' 
        : messageContent,
      tag: `message-${conversationId || 'unknown'}`,
      requireInteraction: false
    })
  }, [showNotification])

  const notifyUnreadCount = useCallback(async (count: number) => {
    if (count === 0) return false

    return showNotification({
      title: 'CherryGifts Chat',
      body: `You have ${count} unread message${count > 1 ? 's' : ''}`,
      tag: 'unread-summary',
      requireInteraction: false
    })
  }, [showNotification])

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    notifyNewMessage,
    notifyUnreadCount
  }
}

// Hook for admin-specific notifications
export function useAdminNotifications() {
  const notifications = useNotifications()
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastNotificationTime, setLastNotificationTime] = useState(0)
  const supabase = createClient()

  const notifyNewCustomerMessage = useCallback(async (
    customerUsername: string,
    messageContent: string,
    conversationId: string
  ) => {
    // Throttle notifications (max one per conversation per minute)
    const now = Date.now()
    const throttleKey = `${conversationId}-${Math.floor(now / 60000)}`
    const lastTime = sessionStorage.getItem(`notification-${throttleKey}`)
    
    if (lastTime && now - parseInt(lastTime) < 60000) {
      return false
    }

    sessionStorage.setItem(`notification-${throttleKey}`, now.toString())

    return notifications.notifyNewMessage(
      `@${customerUsername}`,
      messageContent,
      conversationId
    )
  }, [notifications])

  const updateUnreadCount = useCallback((count: number) => {
    setUnreadCount(count)
    
    // Update document title with unread count
    if (typeof document !== 'undefined') {
      const baseTitle = 'CherryGifts Admin'
      document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle
    }

    // Show periodic unread summary (every 5 minutes)
    const now = Date.now()
    if (count > 0 && now - lastNotificationTime > 5 * 60 * 1000) {
      notifications.notifyUnreadCount(count)
      setLastNotificationTime(now)
    }
  }, [notifications, lastNotificationTime])

  // Listen for real-time message updates (admin version)
  useEffect(() => {
    if (!notifications.permission.granted) return

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'is_admin=eq.false' // Only notify for customer messages
        },
        async (payload) => {
          const message = payload.new as any
          
          // Get conversation details
          const { data: conversation } = await supabase
            .from('conversations')
            .select(`
              *,
              user:user_id (instagram_username, full_name)
            `)
            .eq('id', message.conversation_id)
            .single()

          if (conversation?.user) {
            await notifyNewCustomerMessage(
              conversation.user.instagram_username || conversation.user.full_name || 'Customer',
              message.content,
              message.conversation_id
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [notifications.permission.granted, supabase, notifyNewCustomerMessage])

  return {
    ...notifications,
    unreadCount,
    updateUnreadCount,
    notifyNewCustomerMessage
  }
}

// Browser notification sound
export function playNotificationSound() {
  try {
    // Create a brief, pleasant notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (error) {
    console.warn('Could not play notification sound:', error)
  }
}