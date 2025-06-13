/**
 * Persian language support for specific pages only
 * Landing page, user login, and user signup only
 */

// Persian translations for specific pages
export const persianTexts = {
  // Landing page
  appName: 'چت چری گیفت',
  appDescription: 'پیام‌رسان مدرن با طراحی آشنای اینستاگرام',
  connectInstantly: 'اتصال فوری با ما',
  startChat: 'شروع گفتگو',
  adminPortal: 'ورود مدیریت',
  features: {
    realTimeMessaging: 'پیام‌رسانی سریع',
    readReceipts: 'تیک‌های خوانده شده',
    mobileFriendly: 'موبایل دوست'
  },

  // User login/signup
  login: 'ورود',
  register: 'ثبت‌نام',
  instagramUsername: 'نام کاربری اینستاگرام',
  pin: 'رمز ۴ رقمی',
  username: 'نام کاربری',
  password: 'رمز عبور',
  typeMessage: 'پیامی بنویسید...',
  sendMessage: 'ارسال پیام',
  
  // Common actions
  loading: 'در حال بارگذاری...',
  cancel: 'لغو',
  confirm: 'تأیید',
  
  // Errors for user pages
  errors: {
    usernameRequired: 'نام کاربری اینستاگرام الزامی است',
    usernameInvalid: 'نام کاربری اینستاگرام معتبر نیست',
    usernameNotFound: 'نام کاربری اینستاگرام یافت نشد',
    pinRequired: 'رمز ۴ رقمی الزامی است',
    pinInvalid: 'رمز باید ۴ رقم باشد',
    loginFailed: 'ورود ناموفق. لطفاً دوباره تلاش کنید.',
    networkError: 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.'
  }
}

// Persian number conversion
export function toPersianNumbers(input: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(input).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)])
}

// Check if current page should use Persian
export function isPersianPage(): boolean {
  if (typeof window === 'undefined') return false
  
  const pathname = window.location.pathname
  return (
    pathname === '/' ||                    // Landing page
    pathname === '/users' ||               // User login
    pathname.startsWith('/users/register') // User signup (if exists)
  )
}

// Get Persian text or fallback to key
export function getPersianText(key: string): string {
  const keys = key.split('.')
  let value: any = persianTexts
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Return key if not found
    }
  }
  
  return typeof value === 'string' ? value : key
}