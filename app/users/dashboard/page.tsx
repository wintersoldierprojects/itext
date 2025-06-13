'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { debugLog, debugError } from '@/lib/debug'
import type { ConversationWithUser, User as AuthUserType } from '@/types'
import ConversationListItem from '@/app/components/instagram/ConversationListItem'
import { ChatInterface } from '@/app/components/chat/ChatInterface'

export default function UserDashboard() {
  const [user, setUser] = useState<AuthUserType | null>(null) // Changed to proper type
  const [conversations, setConversations] = useState<ConversationWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()!

  useEffect(() => {
    const fetchUserAndConversations = async () => {
      let userToSet = null;
      try {
        let { data: { user: authUser }, error: userError } = await supabase.auth.getUser(); // Changed const to let
        
        if (userError) {
          console.warn('⚠️ UserDashboard: supabase.auth.getUser() error:', userError.message);
          // Check if a Supabase cookie still exists. If so, don't immediately redirect.
          const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            if (name.includes('sb-') || name.includes('supabase')) acc[name] = value;
            return acc;
          }, {} as Record<string, string>);

          if (Object.keys(cookies).length > 0 && cookies['sb-auth-token']) {
            console.log('🍪 UserDashboard: Supabase cookie found despite getUser error. Attempting to proceed.');
            // Potentially try to use a cached user or show a "reconnecting" state
            // For now, we'll proceed cautiously and try to load conversations if we can get a user ID from a stale session.
            // This part might need more robust handling for cached user data.
            const { data: { session } } = await supabase.auth.getSession(); // Try to get session again
            if (session?.user) {
              authUser = session.user; // Use user from session if available
              console.log('👤 UserDashboard: Using user from getSession() fallback.');
            } else {
              console.error('❌ UserDashboard: No user session available even after cookie check. Redirecting to login.');
              router.push('/users');
              return;
            }
          } else {
            console.error('❌ UserDashboard: No user and no Supabase cookie. Redirecting to login.');
            router.push('/users');
            return;
          }
        }
        
        if (!authUser) {
          debugError('UserDashboard', 'User not found even after checks, redirecting to login');
          router.push('/users');
          return;
        }
        
        // Fetch full user data from database
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (userDataError || !userData) {
          debugError('UserDashboard', `Failed to fetch user data: ${userDataError?.message}`);
          router.push('/users');
          return;
        }
        
        userToSet = userData; // Use the full user data from database
        setUser(userToSet);
      } catch (e: any) { // Added type any for e
        debugError('UserDashboard', `Critical error fetching user: ${e.message}`);
        router.push('/users');
        return;
      }

      if (!userToSet) {
        // This case should ideally not be reached if the logic above is correct
        debugError('UserDashboard', 'User is null after auth checks, cannot load conversations. Redirecting.');
        router.push('/users');
        return;
      }

      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*, admin:admin_id(*), user:user_id(*)')
        .eq('user_id', userToSet.id) // Use userToSet.id here
        .order('last_message_at', { ascending: false })

      if (convError) {
        debugError('UserDashboard', convError)
        setError('Failed to load conversations.')
      } else {
        setConversations(convData as ConversationWithUser[])
      }
      setLoading(false)
    }
    fetchUserAndConversations()
  }, [router, supabase])

  const handleSignOut = async () => {
    debugLog('UserDashboard', 'Signing out')
    console.log('🚪 Starting user signout process...')
    
    try {
      // Clear Supabase session
      await supabase.auth.signOut()
      
      // Clear all cookies manually
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('✅ User signout successful, redirecting to login...')
      router.push('/users')
    } catch (error) {
      console.error('❌ Signout error:', error)
      // Force redirect even if signout fails
      router.push('/users')
    }
  }

  const handleSendMessage = async (conversationId: string, message: string) => {
    debugLog('UserDashboard', 'Sending message', { conversationId, messageLength: message.length })
    
    if (!user) {
      debugError('UserDashboard', 'Cannot send message: user is null');
      return;
    }
    
    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        content: message,
        sender_id: user.id,
        is_admin: false,
      })
    } catch (error) {
      debugError('UserDashboard', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" dir="ltr">
      {!selectedConversation ? (
        <>
          <header className="bg-white border-b border-instagram-gray-200 safe-area-top sticky top-0 z-10">
            <div className="px-4">
              <div className="flex justify-between items-center h-14">
                <button
                  onClick={handleSignOut}
                  className="p-2 -ml-2 micro-press transition-ios"
                >
                  <svg className="w-6 h-6 text-instagram-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-instagram-black">
                  @{user?.instagram_username || 'User'}
                </h1>
                <div className="w-6 h-6" />
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto bg-white smooth-60fps">
            {conversations.length === 0 ? (
              <div className="p-6 text-center mt-8">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-instagram-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-instagram-black mb-1">No conversations yet</p>
                <p className="text-sm text-instagram-gray-400">Your chat with support will appear here.</p>
              </div>
            ) : (
              <div>
                {conversations.map((conversation, index) => (
                  <div key={conversation.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <ConversationListItem
                      conversation={conversation}
                      isActive={false}
                      onClick={() => setSelectedConversation(conversation.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        user ? (
          <ChatInterface 
            conversationId={selectedConversation}
            currentUserId={user.id}
          />
        ) : (
          <div className="flex items-center justify-center h-screen">
            <p>Loading user information...</p>
          </div>
        )
      )}
    </div>
  )
}
