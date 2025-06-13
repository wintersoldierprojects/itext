'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { debugLog, debugError } from '@/lib/debug'

export default function SignupPage() {
  const [instagramUsername, setInstagramUsername] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()!

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: `${instagramUsername}@example.com`,
        password: pin,
        options: {
          data: {
            instagram_username: instagramUsername,
            full_name: instagramUsername,
          },
        },
      })

      if (error) {
        debugError('SignupPage', error)
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        debugLog('SignupPage', 'User signed up successfully', { userId: data.user.id })
        
        // Create user record in the users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: `${instagramUsername}@example.com`,
            instagram_username: instagramUsername,
            full_name: instagramUsername,
            role: 'user',
            is_online: true,
            last_seen: new Date().toISOString(),
          })

        if (insertError) {
          debugError('SignupPage', insertError)
          // Don't fail the signup if user record creation fails
          console.warn('User record creation failed, but auth user created successfully')
        } else {
          debugLog('SignupPage', 'User record created successfully')
        }
        
        router.push('/users/dashboard')
      }
    } catch (err) {
      debugError('SignupPage', err)
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full p-8 space-y-8 bg-white shadow-lg rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="instagram-username" className="sr-only">
                Instagram Username
              </label>
              <input
                id="instagram-username"
                name="instagram-username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Instagram Username"
                value={instagramUsername}
                onChange={(e) => setInstagramUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pin" className="sr-only">
                PIN
              </label>
              <input
                id="pin"
                name="pin"
                type="password"
                required
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="6-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
