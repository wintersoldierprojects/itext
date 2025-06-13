// PWA utilities for Serwist integration
import { debugLog } from './debug'

// Service Worker registration
export async function registerSW(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    debugLog('PWA', '❌ Service Worker not supported')
    return undefined
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    
    debugLog('PWA', '✅ Serwist Service Worker registered', registration.scope)
    
    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              debugLog('PWA', '🔄 New Service Worker available, reloading...')
              if (confirm('A new version is available. Reload to update?')) {
                window.location.reload()
              }
            } else {
              // First time installation
              debugLog('PWA', '✅ Service Worker installed for the first time')
            }
          }
        })
      }
    })

    return registration
  } catch (error) {
    debugLog('PWA', '❌ Service Worker registration failed', String(error))
    return undefined
  }
}

// PWA installation prompt
export function usePWAInstall() {
  let deferredPrompt: any = null

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
      debugLog('PWA', '🏠 PWA install prompt available')
      e.preventDefault()
      deferredPrompt = e
    })
  }

  const installPWA = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      debugLog('PWA', '❌ PWA install prompt not available')
      return false
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      debugLog('PWA', '🏠 PWA install choice', outcome)
      
      deferredPrompt = null
      return outcome === 'accepted'
    } catch (error) {
      debugLog('PWA', '❌ PWA install failed', String(error))
      return false
    }
  }

  const isPWAInstallable = (): boolean => {
    return deferredPrompt !== null
  }

  return { installPWA, isPWAInstallable }
}

// Push notification subscription
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration,
  vapidPublicKey?: string
): Promise<PushSubscription | null> {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      debugLog('PWA', '❌ Push notifications not supported')
      return null
    }

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      debugLog('PWA', '❌ Push notification permission denied')
      return null
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey ? urlBase64ToUint8Array(vapidPublicKey) : undefined
    })

    debugLog('PWA', '✅ Push notification subscription', subscription.endpoint)
    return subscription
  } catch (error) {
    debugLog('PWA', '❌ Push notification subscription failed', String(error))
    return null
  }
}

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Offline message queue
export class OfflineMessageQueue {
  private dbName = 'CherryGiftsChat'
  private storeName = 'offlineMessages'
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async addMessage(message: {
    id: string
    conversationId: string
    content: string
    timestamp: number
    [key: string]: any
  }): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(message)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        debugLog('PWA', '📤 Message queued for offline sync', message.id)
        resolve()
      }
    })
  }

  async getMessages(): Promise<any[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async removeMessage(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async triggerSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register('background-sync-messages')
        debugLog('PWA', '🔄 Background sync triggered')
      } catch (error) {
        debugLog('PWA', '❌ Background sync failed', String(error))
      }
    }
  }
}

// Network status monitoring
export function useNetworkStatus() {
  const isOnline = typeof window !== 'undefined' ? navigator.onLine : true
  
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      debugLog('PWA', '🌐 Network: Back online')
      // Trigger sync when back online
      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration) {
          (registration as any).sync.register('background-sync-messages')
        }
      })
    })
    
    window.addEventListener('offline', () => {
      debugLog('PWA', '📵 Network: Gone offline')
    })
  }

  return { isOnline }
}

// PWA detection
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if running in standalone mode
  if ('standalone' in window.navigator && (window.navigator as any).standalone) {
    return true
  }
  
  // Check display mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }
  
  return false
}

// Cache management
export async function clearPWACache(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      debugLog('PWA', '🗑️ PWA cache cleared')
    } catch (error) {
      debugLog('PWA', '❌ Failed to clear PWA cache', String(error))
    }
  }
}

debugLog('PWA', '🚀 PWA utilities initialized')
