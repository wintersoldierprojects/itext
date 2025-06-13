'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@cherrygifts.com')
  const [password, setPassword] = useState('MySecurePassword123')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    setError(null)

    try {
      console.log('🚀 Starting admin login process...')
      console.log('📧 Email:', email)
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (authError) {
        console.error('❌ Auth error:', authError)
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (!data.user || !data.session) {
        console.error('❌ No user or session returned')
        setError('Login failed. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('✅ Login successful!')
      console.log('👤 User ID:', data.user.id)
      console.log('🍪 Session:', data.session.access_token.substring(0, 20) + '...')
      
      // Check user role before redirecting
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .eq('role', 'admin')
        .single()

      if (userError || !userData) {
        console.error('❌ Admin role check failed:', userError)
        setError('Access denied. Admin role required.')
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      console.log('🎉 Admin role confirmed, redirecting to dashboard...')
      
      // Force page refresh to trigger middleware
      window.location.href = '/admin/dashboard'
      
    } catch (err) {
      console.error('❌ Login error:', err)
      setError('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <ErrorBoundary fallback={<p>Something went wrong on the admin login page.</p>}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="ltr">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <Image 
              src="/logo.png" 
              alt="CherryGifts Logo" 
              width={64}
              height={64}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 text-sm mt-2">Access admin dashboard</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700 text-center">
              <strong>Test Credentials:</strong><br />
              admin@cherrygifts.com<br />
              MySecurePassword123
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
