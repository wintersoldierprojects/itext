/**
 * Internationalization utilities for Persian/English support
 */

import { format as formatJalali, formatDistanceToNow as formatDistanceToNowJalali } from 'date-fns-jalali'
import { format as formatGregorian, formatDistanceToNow as formatDistanceToNowGregorian } from 'date-fns'

export type Locale = 'fa' | 'en'

// Translation dictionary
const translations = {
  fa: {
    // Common
    loading: 'در حال بارگذاری...',
    error: 'خطا',
    success: 'موفق',
    cancel: 'لغو',
    confirm: 'تأیید',
    save: 'ذخیره',
    edit: 'ویرایش',
    delete: 'حذف',
    search: 'جستجو',
    
    // Authentication
    login: 'ورود',
    logout: 'خروج',
    register: 'ثبت‌نام',
    username: 'نام کاربری',
    password: 'رمز عبور',
    pin: 'رمز ۴ رقمی',
    instagramUsername: 'نام کاربری اینستاگرام',
    
    // User Interface
    startChat: 'شروع گفتگو',
    adminPortal: 'ورود مدیریت',
    sendMessage: 'ارسال پیام',
    typeMessage: 'پیامی بنویسید...',
    typing: 'در حال تایپ...',
    online: 'آنلاین',
    offline: 'آفلاین',
    lastSeen: 'آخرین بازدید',
    
    // Chat Interface
    messageStatus: {
      sent: 'ارسال شده',
      delivered: 'تحویل داده شده',
      read: 'خوانده شده'
    },
    
    // Admin Dashboard
    conversations: 'گفتگوها',
    allConversations: 'همه گفتگوها',
    unreadMessages: 'پیام‌های خوانده نشده',
    searchConversations: 'جستجو در گفتگوها',
    markAsRead: 'علامت‌گذاری به عنوان خوانده شده',
    
    // Errors
    errors: {
      networkError: 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.',
      validationError: 'اطلاعات وارد شده صحیح نیست.',
      usernameRequired: 'نام کاربری اینستاگرام الزامی است',
      usernameInvalid: 'نام کاربری اینستاگرام معتبر نیست',
      usernameNotFound: 'نام کاربری اینستاگرام یافت نشد',
      pinRequired: 'رمز ۴ رقمی الزامی است',
      pinInvalid: 'رمز باید ۴ رقم باشد',
      loginFailed: 'ورود ناموفق. لطفاً دوباره تلاش کنید.',
      messageFailed: 'ارسال پیام ناموفق بود',
      connectionLost: 'اتصال قطع شد'
    },
    
    // Time & Date
    time: {
      now: 'اکنون',
      minuteAgo: 'یک دقیقه پیش',
      minutesAgo: 'دقیقه پیش',
      hourAgo: 'یک ساعت پیش',
      hoursAgo: 'ساعت پیش',
      dayAgo: 'دیروز',
      daysAgo: 'روز پیش',
      weekAgo: 'یک هفته پیش',
      weeksAgo: 'هفته پیش'
    },
    
    // Features
    features: {
      realTimeMessaging: 'پیام‌رسانی سریع',
      readReceipts: 'تیک‌های خوانده شده',
      mobileFriendly: 'موبایل دوست'
    },
    
    // App Info
    appName: 'چت چری گیفت',
    appDescription: 'پیام‌رسان مدرن با طراحی آشنای اینستاگرام',
    connectInstantly: 'اتصال فوری با ما'
  },
  
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
let currentLocale: Locale = 'fa' // Default to Persian

// Get current locale
export function getLocale(): Locale {
  return currentLocale
}

// Set current locale
export function setLocale(locale: Locale): void {
  currentLocale = locale
  
  // Update document direction
  if (typeof document !== 'undefined') {
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr'
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
      // Fallback to English if key not found in Persian
      if (lang === 'fa') {
        return t(key, 'en')
      }
      return key // Return key if not found in any language
    }
  }
  
  return typeof value === 'string' ? value : key
}

// Format date with locale support
export function formatDate(date: Date | string, pattern: string = 'PPP', locale?: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const lang = locale || currentLocale
  
  if (lang === 'fa') {
    return formatJalali(dateObj, pattern)
  } else {
    return formatGregorian(dateObj, pattern)
  }
}

// Format relative time with locale support
export function formatRelativeTime(date: Date | string, locale?: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const lang = locale || currentLocale
  
  if (lang === 'fa') {
    return formatDistanceToNowJalali(dateObj, { addSuffix: true })
  } else {
    return formatDistanceToNowGregorian(dateObj, { addSuffix: true })
  }
}

// Persian number conversion
export function toPersianNumbers(input: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(input).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)])
}

// English number conversion
export function toEnglishNumbers(input: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  let result = input
  
  persianDigits.forEach((persianDigit, index) => {
    result = result.replace(new RegExp(persianDigit, 'g'), index.toString())
  })
  
  return result
}

// Check if current locale is RTL
export function isRTL(locale?: Locale): boolean {
  const lang = locale || currentLocale
  return lang === 'fa'
}

// Get direction for CSS
export function getDirection(locale?: Locale): 'rtl' | 'ltr' {
  return isRTL(locale) ? 'rtl' : 'ltr'
}

// Hook for React components
export function useTranslation() {
  return {
    t,
    locale: currentLocale,
    setLocale,
    formatDate,
    formatRelativeTime,
    toPersianNumbers,
    toEnglishNumbers,
    isRTL: isRTL(),
    direction: getDirection()
  }
}

// Initialize locale from browser or localStorage
export function initializeLocale(): void {
  if (typeof window !== 'undefined') {
    // Check localStorage first
    const savedLocale = localStorage.getItem('cherrygifts-locale') as Locale
    if (savedLocale && (savedLocale === 'fa' || savedLocale === 'en')) {
      setLocale(savedLocale)
      return
    }
    
    // Check browser language
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('fa') || browserLang.startsWith('ir')) {
      setLocale('fa')
    } else {
      setLocale('en')
    }
  }
}

// Save locale to localStorage
export function saveLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cherrygifts-locale', locale)
  }
  setLocale(locale)
}