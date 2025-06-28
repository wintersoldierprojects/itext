'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { ConversationWithUser, User as AuthUserType } from '@/types'
import { debugLog, debugError } from '@/lib/debug'
import ConversationListItem from '@/app/components/instagram/ConversationListItem'
import { ChatInterface } from '@/app/components/chat/ChatInterface'
import { mockConversations, mockMessages } from '@/lib/mock-data'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

const CONVERSATIONS_PER_PAGE = 20

export default function AdminDashboard() {
  const [conversations, setConversations] = useState<ConversationWithUser[]>([])
  const [adminUser, setAdminUser] = useState<AuthUserType | null>(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const router = useRouter()
  const supabase = createClient()!

  // Pagination state
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { entry, isIntersecting } = useIntersectionObserver(loadMoreRef)

  useEffect(() => {
    const fetchAdminUserAndConversations = async () => {
      debugLog('AdminDashboard', 'Component initialized, fetching admin user and conversations', {
        timestamp: new Date().toISOString(),
        currentPath: '/admin/dashboard'
      });
      
      let adminUserToSet = null;
      try {
        let { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.warn('⚠️ AdminDashboard: supabase.auth.getUser() error:', userError.message);
          const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            if (name.includes('sb-') || name.includes('supabase')) acc[name] = value;
            return acc;
          }, {} as Record<string, string>);

          if (Object.keys(cookies).length > 0 && cookies['sb-auth-token']) {
            console.log('🍪 AdminDashboard: Supabase cookie found despite getUser error. Attempting to use session data.');
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              authUser = session.user;
              console.log('👤 AdminDashboard: Using user from getSession() fallback due to initial getUser error.');
            } else {
              console.error('❌ AdminDashboard: No user session available via getSession() even with cookie. Redirecting to login.');
              router.push('/admin');
              return;
            }
          } else {
            console.error('❌ AdminDashboard: No user from getUser() and no Supabase cookie. Redirecting to login.');
            router.push('/admin');
            return;
          }
        }

        if (!authUser) {
          debugError('AdminDashboard', 'Admin user is null after all checks, redirecting to login.');
          router.push('/admin');
          return;
        }
        
        const { data: adminData, error: roleError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .eq('role', 'admin')
          .single();

        if (roleError || !adminData) {
          debugError('AdminDashboard', `Admin role verification failed or user not admin. User ID: ${authUser.id}, Role Error: ${roleError?.message}`);
          // Consider signing out if a non-admin user somehow has an admin-area session
          // await supabase.auth.signOut(); 
          router.push('/admin');
          return;
        }
        
        adminUserToSet = adminData;
        setAdminUser(adminUserToSet);
        debugLog('AdminDashboard', 'Admin user authenticated and role verified', { userId: adminUserToSet.id, email: adminUserToSet.email });
        
        // Initial load of conversations
        loadConversations(0); // Load first page
      } catch (e: any) {
        debugError('AdminDashboard', `Critical error during admin user fetch/verification: ${e.message}`);
        router.push('/admin');
        return;
      }
    };

    fetchAdminUserAndConversations();
  }, [router, supabase]);

  // Effect to load more conversations when the loadMoreRef is intersecting and there's more data
  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1)
    }
  }, [isIntersecting, hasMore, loading])

  // Effect to trigger conversation loading when page changes
  useEffect(() => {
    if (page > 0 || (page === 0 && conversations.length === 0 && !loading)) {
      loadConversations(page)
    }
  }, [page])

  const loadConversations = async (pageToLoad: number) => { 
    debugLog('AdminDashboard', `Loading conversations for admin, page: ${pageToLoad}`);
    setLoading(true);
    
    const offset = pageToLoad * CONVERSATIONS_PER_PAGE;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user:user_id (
            id,
            instagram_username,
            full_name,
            profile_picture_url,
            is_online,
            last_seen
          )
        `)
        .order('last_message_at', { ascending: false })
        .range(offset, offset + CONVERSATIONS_PER_PAGE - 1) // Apply range for pagination

      if (error) throw error;
    
      if (data && data.length > 0) {
        setConversations((prevConversations) => {
          // Filter out duplicates if any, based on conversation ID
          const newConversations = data.filter(
            (newConv) => !prevConversations.some((prevConv) => prevConv.id === newConv.id)
          );
          return [...prevConversations, ...newConversations];
        });
        setHasMore(data.length === CONVERSATIONS_PER_PAGE); // Check if there are more pages
        console.log(`✅ Loaded ${data.length} real conversations for page ${pageToLoad}`);
      } else {
        if (pageToLoad === 0) { // Only use mock data if no real data on first load
          console.warn('⚠️ No real conversations found, using mock data');
          setConversations(mockConversations);
          setIsUsingMockData(true);
        }
        setHasMore(false); // No more data
      }
    } catch (error) {
      console.error('❌ Database error:', error);
      if (pageToLoad === 0) { // Only use mock data as fallback on first load
        setConversations(mockConversations);
        setIsUsingMockData(true);
        setError('Using demo data - database connection issue');
      }
      setHasMore(false); // Assume no more data on error
    } finally {
      setLoading(false)
      debugLog('AdminDashboard', `Conversations loading complete for page: ${pageToLoad}`)
    }
  }

  const filteredAndSortedConversations = conversations
    .filter(conv => {
      if (searchQuery) {
        const user = conv.user
        const searchLower = searchQuery.toLowerCase()
        const matchesUsername = user?.instagram_username?.toLowerCase().includes(searchLower)
        const matchesName = user?.full_name?.toLowerCase().includes(searchLower)
        const matchesLastMessage = conv.last_message_content?.toLowerCase().includes(searchLower)
        
        if (!matchesUsername && !matchesName && !matchesLastMessage) {
          return false
        }
      }
      
      return true
    })
    .sort((a, b) => {
      return new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
    })

  const handleSignOut = async () => {
    debugLog('AdminDashboard', 'Signing out')
    console.log('🚪 Starting signout process...')
    
    try {
      await supabase.auth.signOut()
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log('✅ Signout successful, redirecting to login...')
      router.push('/admin')
    } catch (error) {
      console.error('❌ Signout error:', error)
      router.push('/admin')
    }
  }

  const handleConversationSelect = (conversationId: string) => {
    debugLog('AdminDashboard', 'Conversation selected', { conversationId })
    setSelectedConversation(conversationId)
  }

  const handleSendMessage = async (conversationId: string, message: string) => {
    debugLog('AdminDashboard', 'Sending message', { conversationId, messageLength: message.length })
    
    try {
      console.log(`📨 Admin sent message to ${conversationId}: "${message}"`)
    } catch (error) {
      debugError('AdminDashboard', error)
    }
  }

  if (loading && conversations.length === 0) { // Only show full loading if no conversations loaded yet
    return (
      <div className="min-h-screen bg-instagram-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-instagram-blue mx-auto mb-4"></div>
          <p className="text-ig-base text-instagram-gray-500">Loading conversations...</p>
        </div>
      </div>
    )
  }

  if (error && conversations.length === 0) { // Only show full error if no conversations loaded yet
    return (
      <div className="min-h-screen bg-instagram-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              setPage(0) // Reset page on retry
              setHasMore(true) // Assume more data on retry
              loadConversations(0)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={<p>Something went wrong on the admin dashboard.</p>}>
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
                  <h1 className="text-lg font-semibold text-instagram-black">Direct</h1>
                  <div className="w-6 h-6" />
                </div>
              </div>
            </header>

            {isUsingMockData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mx-4 mb-2">
                <p className="text-sm text-yellow-800">
                  ⚠️ Demo Mode: Showing sample conversations
                </p>
              </div>
            )}

            <div className="px-4 py-2 bg-white">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-instagram-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  dir="ltr"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-instagram-gray-100 border-none rounded-lg text-sm text-instagram-black placeholder-instagram-gray-400 focus:outline-none focus:bg-instagram-gray-200 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-4 w-4 text-instagram-gray-400 hover:text-instagram-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <ErrorBoundary fallback={<p>Error loading conversation list.</p>}>
              <div className="flex-1 overflow-y-auto bg-white smooth-60fps">
                {filteredAndSortedConversations.length === 0 && !loading ? ( // Show no results only if not loading and no conversations
                  <div className="p-6 text-center mt-8">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-instagram-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-base font-medium text-instagram-black mb-1">
                      {searchQuery ? 'No results found' : 'No conversations yet'}
                    </p>
                    <p className="text-sm text-instagram-gray-400">
                      {searchQuery ? 'Try a different search term' : 'New conversations will appear here'}
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredAndSortedConversations.map((conversation, index) => (
                      <div key={conversation.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <ConversationListItem
                          conversation={conversation}
                          isActive={false}
                          onClick={() => handleConversationSelect(conversation.id)}
                        />
                      </div>
                    ))}
                    {hasMore && (
                      <div ref={loadMoreRef} className="flex justify-center p-4">
                        {loading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-instagram-blue"></div>
                        ) : (
                          <button
                            onClick={() => setPage((prevPage) => prevPage + 1)}
                            className="text-instagram-blue text-sm font-semibold"
                          >
                            Load More
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ErrorBoundary>
          </>
        ) : (
          adminUser ? (
            <ErrorBoundary fallback={<p>Error loading chat interface.</p>}>
              <ChatInterface
                conversationId={selectedConversation}
                currentUserId={adminUser.id}
                isDemoMode={isUsingMockData}
                initialMockMessages={isUsingMockData && selectedConversation ? mockMessages[selectedConversation as keyof typeof mockMessages] : undefined}
              />
            </ErrorBoundary>
          ) : (
            <div className="flex items-center justify-center h-screen">
              <p>Loading user information...</p>
            </div>
          )
        )}
      </div>
    </ErrorBoundary>
  )
}
