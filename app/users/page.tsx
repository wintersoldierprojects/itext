'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { lookupInstagramUserCached } from '@/lib/instagram'

export default function UserLoginPage() {
  const [instagramUsername, setInstagramUsername] = useState('mehradworld')
  const [pin, setPin] = useState('112233')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isValidatingUsername, setIsValidatingUsername] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [instagramUser, setInstagramUser] = useState<{
    username: string;
    full_name: string;
    profile_picture_url: string;
    is_verified: boolean;
    follower_count?: number;
    is_private: boolean;
  } | null>(null)
  const router = useRouter()
  const supabase = createClient()!

  // Check for existing session on page load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log('🔍 Checking for existing user session...')
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session check error:', sessionError)
          setIsCheckingSession(false)
          return
        }

        if (session?.user) {
          console.log('✅ Found existing session, checking user role...')
          console.log('🍪 Session details:', {
            userId: session.user.id,
            email: session.user.email,
            expiresAt: session.expires_at,
            accessToken: session.access_token?.substring(0, 20) + '...',
            refreshToken: session.refresh_token?.substring(0, 20) + '...'
          })

          // Check if user has user role
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, instagram_username')
            .eq('id', session.user.id)
            .eq('role', 'user')
            .single()

          if (userError || !userData) {
            console.warn('⚠️ User role check failed or user not found in users table, but session exists. Staying on login page.', { userId: session.user.id, userError, userData })
            setIsCheckingSession(false)
            return
          }

          console.log('🎉 User session valid, redirecting to dashboard...')
          router.push('/users/dashboard')
          return
        }

        console.log('ℹ️ No existing session found')
        setIsCheckingSession(false)
      } catch (error) {
        console.error('❌ Session check failed:', error)
        setIsCheckingSession(false)
      }
    }

    checkExistingSession()
  }, [supabase, router])

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-instagram-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-instagram-blue mx-auto mb-4"></div>
          <p className="text-instagram-gray-600">Checking session...</p>
        </div>
      </div>
    )
  }

  // Validate Instagram username on blur
  const handleUsernameBlur = async () => {
    if (!instagramUsername || instagramUsername.length < 3) return
    
    setIsValidatingUsername(true)
    setError(null)
    
    try {
      const result = await lookupInstagramUserCached(instagramUsername)
      
      if (result.isValid && result.exists && result.user) {
        setInstagramUser(result.user)
      } else if (result.isValid && !result.exists) {
        setError('Username not found')
        setInstagramUser(null)
      } else {
        setError(result.error || 'Invalid username')
        setInstagramUser(null)
      }
    } catch {
      setError('Network error')
      setInstagramUser(null)
    } finally {
      setIsValidatingUsername(false)
    }
  }

  // PIN input handler - only allow numbers
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPin(value)
  }

  const handleLogin = async () => {
    if (isLoading || !instagramUsername || pin.length !== 6) return
    
    setIsLoading(true)
    setError(null)

    try {
      console.log('🚀 Starting user login process...')
      console.log('👤 Username:', instagramUsername)
      console.log('🔢 PIN:', pin)
      
      // Simple login - check credentials against database
      const email = `${instagramUsername}@example.com`
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pin,
      })

      if (authError) {
        console.error('❌ Auth error:', authError)
        setError('Incorrect username or PIN')
        setIsLoading(false)
        return
      }

      if (!data.user || !data.session) {
        console.error('❌ No user or session returned')
        setError('Login failed')
        setIsLoading(false)
        return
      }

      console.log('✅ Login successful!')
      console.log('🍪 Session created:', {
        userId: data.user.id,
        email: data.user.email,
        sessionId: data.session.access_token.substring(0, 20) + '...',
        expiresAt: data.session.expires_at,
        expiresIn: data.session.expires_in,
        refreshToken: data.session.refresh_token?.substring(0, 20) + '...',
        tokenType: data.session.token_type
      })

      // Log all cookies
      console.log('🍪 All cookies after login:', document.cookie)
      
      // Parse and display Supabase cookies specifically
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=')
        if (name.includes('sb-') || name.includes('supabase')) {
          acc[name] = value
        }
        return acc
      }, {} as Record<string, string>)
      
      console.log('🍪 Supabase cookies:', cookies)

      // Check if user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('instagram_username', instagramUsername)
        .eq('role', 'user')
        .single()

      if (userError || !userData) {
        console.error('❌ User role check failed:', userError)
        setError('Access denied. User role required.')
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      console.log('🎉 User role confirmed, redirecting to dashboard...')
      
      // Force page refresh to trigger middleware
      window.location.href = '/users/dashboard'
      
    } catch (err) {
      console.error('❌ Login error:', err)
      setError('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-instagram-gray-50 flex items-center justify-center p-4 safe-area-top safe-area-bottom" dir="ltr">
      <div className="w-full max-w-[350px]">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 shadow-ig overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="CherryGifts Logo" 
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <h1 className="text-ig-2xl text-instagram-black mb-1">CherryGifts Chat</h1>
          <p className="text-ig-base text-instagram-gray-400">Connect instantly</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-ig-lg p-6 shadow-ig-md border border-instagram-gray-200">
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            {/* Instagram Username */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-instagram-gray-400 text-ig-base">@</span>
                </div>
                <input
                  type="text"
                  id="instagramUsername"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  onBlur={handleUsernameBlur}
                  className="input-ig w-full pl-8 pr-12 text-ig-base text-instagram-black placeholder-instagram-gray-400 text-left"
                  placeholder="Instagram Username"
                  autoComplete="username"
                  dir="ltr"
                  disabled={isLoading}
                />
                {isValidatingUsername && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-instagram-blue border-t-transparent rounded-full"></div>
                  </div>
                )}
                {instagramUser && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image 
                        src={instagramUser.profile_picture_url} 
                        alt={instagramUser.username}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Instagram User Preview */}
              {instagramUser && (
                <div className="mt-3 p-3 bg-instagram-gray-50 rounded-ig-md border border-instagram-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-instagram-gray-200">
                      <Image 
                        src={instagramUser.profile_picture_url} 
                        alt={instagramUser.username}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-ig-md text-instagram-black">{instagramUser.full_name}</span>
                        {instagramUser.is_verified && (
                          <svg className="w-4 h-4 text-instagram-blue" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-ig-sm text-instagram-gray-500">@{instagramUser.username}</div>
                      {instagramUser.follower_count && (
                        <div className="text-ig-xs text-instagram-gray-400">{instagramUser.follower_count.toLocaleString()} followers</div>
                      )}
                    </div>
                    <div className="text-instagram-green">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PIN */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={pin || ''}
                  onChange={handlePinChange}
                  placeholder="6-digit PIN"
                  className="input-ig w-full text-center tracking-widest text-ig-lg text-instagram-black placeholder-instagram-gray-400"
                  dir="ltr"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div className="flex gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full border-2 ${
                          pin && pin.length > i 
                            ? 'bg-instagram-blue border-instagram-blue' 
                            : 'border-instagram-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-instagram-red/10 border border-instagram-red/20 rounded-ig-md p-3">
                <p className="text-ig-sm text-instagram-red">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-ig w-full py-3 text-ig-md transition-ig hover-ig press-ig"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-ig-sm text-instagram-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => router.push('/users/signup')}
                className="text-instagram-blue hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-ig-sm text-instagram-gray-400">
            CherryGifts Chat
          </p>
        </div>
      </div>
    </div>
  )
}