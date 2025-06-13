'use client'

import { useState, useEffect, useCallback } from 'react'

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window)
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported')
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [isSupported])

  const subscribeToPush = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      throw new Error('Push notifications not available or not permitted')
    }

    try {
      const registration = await navigator.serviceWorker.ready
      
      // VAPID public key (this should be generated and stored securely)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BDqZ9xKPcB-4KQjp-FVbCwZsWJy-QHDZr8qKzZgNzKmXoFrBr3dJpUqGhV8EZpFwQhDzYrQ6xKvN5LqK4Y3Z8F4'
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      setSubscription(subscription)
      
      // Send subscription to your backend
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      })

      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      throw error
    }
  }, [isSupported, permission])

  const unsubscribeFromPush = useCallback(async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe()
        setSubscription(null)
        
        // Notify backend about unsubscription
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
      } catch (error) {
        console.error('Failed to unsubscribe from push notifications:', error)
        throw error
      }
    }
  }, [subscription])

  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'cherrygifts-message',
        ...options
      } as NotificationOptions & { vibrate?: number[] })
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }, [permission])

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showNotification
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}