'use client'

import React, { useState, useRef, useEffect } from 'react'

// Completely isolated test page - no external dependencies
export default function CompleteTestPage() {
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(generateMockMessages(20))
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mock data generator
  function generateMockMessages(count: number) {
    const messages = []
    const reactions = ['❤️', '👍', '😂', '😮', '😢', '😡']
    
    for (let i = 0; i < count; i++) {
      const isOwn = i % 3 === 0
      const status = i % 4 === 0 ? 'read' : i % 3 === 0 ? 'delivered' : 'sent'
      
      messages.push({
        id: `msg-${i}`,
        content: `Test message ${i + 1} - ${isOwn ? 'User message' : 'Admin response'} with ${status} status`,
        isOwn,
        status: status as 'sent' | 'delivered' | 'read',
        timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
        reactions: i % 5 === 0 ? [reactions[Math.floor(Math.random() * reactions.length)]] : []
      })
    }
    
    return messages
  }

  const mockConversations = [
    {
      id: '1',
      user: {
        name: 'Mehrad World',
        username: 'mehradworld',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehradworld',
        isOnline: true
      },
      lastMessage: 'Hey! How can I help you today?',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 3
    },
    {
      id: '2',
      user: {
        name: 'Sophia Wilson',
        username: 'sophia.w',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
        isOnline: false
      },
      lastMessage: 'Thanks for the quick response!',
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      unreadCount: 0
    },
    {
      id: '3',
      user: {
        name: 'Alex Designer',
        username: 'alex.design',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        isOnline: true
      },
      lastMessage: 'Can you send me the design files?',
      lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
      unreadCount: 1
    }
  ]

  const selectedConv = mockConversations.find(c => c.id === selectedConversation)

  const handleSendMessage = () => {
    if (!message.trim()) return
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      isOwn: true,
      status: 'sent' as const,
      timestamp: new Date().toISOString(),
      reactions: []
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessage('')
    
    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Add auto-response
      const autoResponse = {
        id: `msg-${Date.now() + 1}`,
        content: 'Thanks for your message! This is an automated response for testing.',
        isOwn: false,
        status: 'read' as const,
        timestamp: new Date().toISOString(),
        reactions: []
      }
      setMessages(prev => [...prev, autoResponse])
    }, 2000)
  }

  const MessageBubble = ({ message }: { message: any }) => {
    const formatTime = (timestamp: string) => {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }

    return (
      <div className={`flex mb-4 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatTime(message.timestamp)}
            </span>
            {message.isOwn && (
              <span className="text-xs text-blue-100 ml-2">
                {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓' : '○'}
              </span>
            )}
          </div>
          {message.reactions.length > 0 && (
            <div className="mt-1">
              {message.reactions.map((reaction: string, idx: number) => (
                <span key={idx} className="text-sm">{reaction}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const ConversationItem = ({ conversation, isSelected, onClick }: {
    conversation: any
    isSelected: boolean
    onClick: () => void
  }) => {
    const timeAgo = new Date(conversation.lastMessageTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    return (
      <div
        className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
          isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
        }`}
        onClick={onClick}
      >
        <div className="relative">
          <img
            src={conversation.user.avatar}
            alt={conversation.user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {conversation.user.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {conversation.user.name}
            </p>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">
              {conversation.lastMessage}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const DesktopLayout = () => (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation === conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
            />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                <img
                  src={selectedConv.user.avatar}
                  alt={selectedConv.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedConv.user.name}</h3>
                  <p className="text-sm text-gray-500">@{selectedConv.user.username}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-200 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const MobileLayout = () => (
    <div className="h-screen bg-white flex flex-col max-w-sm mx-auto border border-gray-200">
      {!selectedConversation ? (
        // Conversations List
        <>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={false}
                onClick={() => setSelectedConversation(conversation.id)}
              />
            ))}
          </div>
        </>
      ) : (
        // Chat View
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedConversation(null)}
                className="mr-3 p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <img
                src={selectedConv?.user.avatar}
                alt={selectedConv?.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">{selectedConv?.user.name}</h3>
                <p className="text-sm text-gray-500">@{selectedConv?.user.username}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100" dir="ltr">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Chat Interface Test</h1>
            <p className="text-gray-600">Full-featured chat interface for testing (English/LTR only)</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('desktop')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'desktop'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setActiveView('mobile')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'mobile'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeView === 'desktop' ? (
          <div className="max-w-6xl mx-auto border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <DesktopLayout />
          </div>
        ) : (
          <div className="flex justify-center">
            <MobileLayout />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="max-w-6xl mx-auto mt-8 mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 text-sm">
          ✅ Isolated test environment with no external dependencies. 
          Features: Real-time messaging simulation, typing indicators, message status, responsive design.
        </p>
      </div>
    </div>
  )
}