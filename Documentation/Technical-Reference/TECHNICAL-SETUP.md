# 🔧 Technical Setup & Configuration

Complete technical specifications and configuration guide for the Instagram DM replica.

**See Also**: 
- [Main Project Guide](../../CLAUDE.md) - Primary documentation
- [Progress Tracking](../Project-Management/progress.md) - Current status  
- [Elite MCP Framework](../Development-Framework/ELITE-DEVELOPER-ORCHESTRATION-FRAMEWORK.md) - Development methodology
- [Instagram Design Guide](./INSTAGRAM-DESIGN-GUIDE.md) - UI specifications
- [Debugging Guide](./DEBUGGING-GUIDE.md) - Troubleshooting procedures

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom Instagram Design System  
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Animations**: CSS transitions + Custom easing curves
- **PWA**: next-pwa for offline support
- **Deployment**: Vercel

## 🗄️ Database Schema (Supabase)

### Core Tables
```sql
-- Users with Instagram integration
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  instagram_username VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  profile_picture_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation tracking
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_content TEXT,
  unread_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages with status tracking
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'link', 'image')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time typing indicators
CREATE TABLE typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  last_typed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 seconds')
);

-- Message reactions (Phase 9)
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);
```

## 🔐 Environment Configuration

### .env.local
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CherryGifts Chat
NEXT_PUBLIC_DEBUG_MODE=true
# Sentry configuration
# Use your own DSN in production. A default DSN can remain for local testing.
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### Supabase Clients
```typescript
// lib/supabase.ts - Browser client
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase-server.ts - Server client  
import { createServerClient } from '@supabase/ssr'
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: /* cookie handling */ }
  )
}
```

## 🔒 Authentication System

### Authentication Flow ✅ UPDATED
1. **Admin**: Email/password → Supabase Auth → Role verification from database
2. **User**: Instagram username + PIN → Supabase Auth → Auto user profile  
3. **Session**: JWT tokens with automatic refresh and persistent login
4. **Protection**: Supabase-first role verification, zero client overrides

### Admin Authentication Features ✅ NEW
- **Persistent Sessions**: Login maintained across browser restarts
- **Auto-Redirect**: Authenticated users go directly to dashboard  
- **Role Verification**: Queries actual user data from Supabase before access
- **Session Management**: Real-time auth state listening
- **Transparent Errors**: Shows exact user role if access denied
- **Database-First**: Client never overrides Supabase data

### Middleware (middleware.ts)
```typescript
export async function middleware(request: NextRequest) {
  // Admin dashboard protection
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect('/admin')
    
    // Verify admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (userData?.role !== 'admin') {
      return NextResponse.redirect('/admin')
    }
  }

  // User chat protection
  if (request.nextUrl.pathname.startsWith('/users/chat')) {
    if (!user) return NextResponse.redirect('/users')
  }

  return supabaseResponse
}
```

## 🎨 Instagram Design System

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        instagram: {
          blue: '#1379f5',
          'blue-light': '#B2DFFC',
          'blue-dark': '#0084D6',
          gray: {
            50: '#f8f9fa',
            100: '#e7edf4',
            200: '#cedae9',
            400: '#48709d',
          },
          black: '#0d141c',
          green: '#4AB557',
          red: '#ED4956',
        }
      },
      animation: {
        'ios-slide-in': 'iosSlideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'android-scale-in': 'androidScaleIn 0.225s cubic-bezier(0.4, 0, 0.2, 1)',
        'message-slide-in': 'messageSlideIn 0.3s ease-out',
        'micro-press': 'microPress 0.1s ease',
      }
    },
  },
}
```

### CSS Animation System
```css
/* Instagram Animations (globals.css) */
@keyframes iosSlideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes androidScaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes messageSlideIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Transition Classes */
.transition-ios { transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.transition-android { transition: all 0.225s cubic-bezier(0.4, 0, 0.2, 1); }
.transition-smooth { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.transition-spring { transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }

/* Performance Optimization */
.smooth-60fps {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

## 🔄 Real-time Implementation

### Message Subscriptions
```typescript
const subscribeToMessages = (conversationId: string) => {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, handleNewMessage)
    .on('postgres_changes', {
      event: 'UPDATE', 
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, handleMessageUpdate)
    .subscribe()
}
```

### Touch Interactions Hook
```typescript
// hooks/useTouchInteractions.ts
export function useTouchInteractions(options: TouchInteractionOptions) {
  const handleTouchStart = (e: React.TouchEvent) => {
    // Capture touch start position and time
    touchStartX.current = e.touches[0].clientX
    touchStartTime.current = Date.now()
    
    // Start long press timer
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress()
        // Haptic feedback
        if ('vibrate' in navigator) navigator.vibrate(50)
      }, longPressDelay)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaTime = Date.now() - touchStartTime.current

    // Swipe detection
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0 && onSwipeRight) onSwipeRight()
      else if (deltaX < 0 && onSwipeLeft) onSwipeLeft()
    }

    // Double tap detection
    if (onDoubleTap && deltaTime < 300) {
      const currentTime = Date.now()
      if (currentTime - lastTapTime.current < 300) {
        onDoubleTap()
        if ('vibrate' in navigator) navigator.vibrate(30)
      }
      lastTapTime.current = currentTime
    }
  }

  return { touchHandlers: { onTouchStart, onTouchMove, onTouchEnd } }
}
```

## 📱 Development Commands

```bash
# Development
cd cherrygifts-chat
npm run dev              # Start dev server (http://localhost:3000)
DEBUG=cherrygifts:* npm run dev  # With debugging

# Production
npm run build           # Production build
npm run start           # Start production server

# Testing
npx tsc --noEmit       # TypeScript validation
npm run lint           # ESLint check
```

## 🎛️ Key Configuration Files

### 1. Animation Performance (globals.css)
```css
/* 60fps Performance Optimization */
@media (prefers-reduced-motion: no-preference) {
  .smooth-60fps {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }
}

/* Will-change for performance */
.will-change-transform { will-change: transform; }
.will-change-opacity { will-change: opacity; }
```

### 2. Touch Optimization (globals.css)  
```css
/* Remove tap highlights and enable smooth scrolling */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-overflow-scrolling: touch;
}

/* Touch-friendly sizing */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### 3. Safe Area Support (globals.css)
```css
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
.safe-area-left { padding-left: env(safe-area-inset-left); }
.safe-area-right { padding-right: env(safe-area-inset-right); }
```

## 🚀 Deployment Configuration

### Vercel Settings
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint",
    "debug": "DEBUG=cherrygifts:* next dev"
  }
}
```

### Performance Targets ✅
- **Message Delivery**: < 100ms
- **Page Load**: < 1 second  
- **Build Size**: < 2MB gzipped
- **Animation FPS**: 60fps sustained
- **Lighthouse Score**: 90+

## ⚙️ Common Customization Points

### Change Primary Color
```css
/* In globals.css */
:root {
  --ig-blue: #your-brand-color;
  --ig-blue-hover: #your-hover-color;
}
```

### Adjust Animation Speed
```css
/* Faster animations */
.transition-ios { transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); }

/* Slower animations */  
.transition-ios { transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
```

### Modify Touch Sensitivity
```typescript
// In useTouchInteractions.ts
const swipeThreshold = 30;     // Lower = more sensitive
const longPressDelay = 500;    // Milliseconds
```

## 🧪 Test Credentials

**Admin**: admin@cherrygifts.com / MySecurePassword123  
**User**: mehradworld / 1122

**Start Command**: `pkill -f "next.*dev" && cd cherrygifts-chat && DEBUG=cherrygifts:* npm run dev`