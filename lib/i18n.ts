/**
 * Internationalization utilities (English only)
 */

import { format as formatGregorian, formatDistanceToNow as formatDistanceToNowGregorian } from 'date-fns'

export type Locale = 'en'

// Translation dictionary
const translations = {
  
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    
    // Authentication
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    pin: '4-Digit PIN',
    instagramUsername: 'Instagram Username',
    
    // User Interface
    startChat: 'Start Chat',
    adminPortal: 'Admin Portal',
    sendMessage: 'Send Message',
    typeMessage: 'Type a message...',
    typing: 'typing...',
    online: 'Online',
    offline: 'Offline',
    lastSeen: 'Last seen',
    
    // Chat Interface
    messageStatus: {
      sent: 'Sent',
      delivered: 'Delivered',
      read: 'Read'
    },
    
    // Admin Dashboard
    conversations: 'Conversations',
    allConversations: 'All Conversations',
    unreadMessages: 'Unread Messages',
    searchConversations: 'Search conversations',
    markAsRead: 'Mark as read',
    
    // Errors
    errors: {
      networkError: 'Network error. Please check your internet connection.',
      validationError: 'Invalid input data.',
      usernameRequired: 'Instagram username is required',
      usernameInvalid: 'Invalid Instagram username',
      usernameNotFound: 'Instagram username not found',
      pinRequired: '4-digit PIN is required',
      pinInvalid: 'PIN must be 4 digits',
      loginFailed: 'Login failed. Please try again.',
      messageFailed: 'Failed to send message',
      connectionLost: 'Connection lost'
    },
    
    // Time & Date
    time: {
      now: 'now',
      minuteAgo: 'a minute ago',
      minutesAgo: 'minutes ago',
      hourAgo: 'an hour ago',
      hoursAgo: 'hours ago',
      dayAgo: 'yesterday',
      daysAgo: 'days ago',
      weekAgo: 'a week ago',
      weeksAgo: 'weeks ago'
    },
    
    // Features
    features: {
      realTimeMessaging: 'Real-time Messaging',
      readReceipts: 'Read Receipts',
      mobileFriendly: 'Mobile Friendly'
    },
    
    // App Info
    appName: 'CherryGifts Chat',
    appDescription: 'Modern messaging platform with Instagram-familiar interface',
    connectInstantly: 'Connect with us instantly'
  }
}

// Current locale state
let currentLocale: Locale = 'en'

// Get current locale
export function getLocale(): Locale {
  return currentLocale
}

// Set current locale
export function setLocale(locale: Locale): void {
  currentLocale = locale
  
  // Update document direction
  if (typeof document !== 'undefined') {
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = locale
  }
}

// Get translation for a key
export function t(key: string, locale?: Locale): string {
  const lang = locale || currentLocale
  const keys = key.split('.')
  let value: Record<string, unknown> | string = translations[lang]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k] as Record<string, unknown> | string
    } else {
      return key
    }
  }
  
  return typeof value === 'string' ? value : key
}

// Format date with locale support
export function formatDate(date: Date | string, pattern: string = 'PPP', locale?: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatGregorian(dateObj, pattern)
}

// Format relative time with locale support
export function formatRelativeTime(date: Date | string, locale?: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNowGregorian(dateObj, { addSuffix: true })
}

// Hook for React components
export function useTranslation() {
  return {
    t,
    locale: currentLocale,
    setLocale,
    formatDate,
    formatRelativeTime,
    isRTL: false,
    direction: 'ltr'
  }
}

// Initialize locale from browser or localStorage
export function initializeLocale(): void {
  if (typeof window !== 'undefined') {
    // Check localStorage first
    const savedLocale = localStorage.getItem('cherrygifts-locale') as Locale
    if (savedLocale === 'en') {
      setLocale(savedLocale)
      return
    }

    setLocale('en')
  }
}

// Save locale to localStorage
export function saveLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cherrygifts-locale', locale)
  }
  setLocale(locale)
}