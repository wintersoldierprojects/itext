import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton pattern for connection reuse
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        cookieOptions: {
          name: 'sb-auth-token',
          domain: undefined,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60, // 30 days in seconds (1 month)
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'x-application-name': 'cherrygifts-chat'
          }
        }
      }
    )
  }
  return supabaseInstance
}
