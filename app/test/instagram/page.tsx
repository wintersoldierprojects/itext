'use client'

import React, { useState } from 'react'

// Completely isolated test page - no external requests or cookies
export default function InstagramTestPage() {
  const [selectedComponent, setSelectedComponent] = useState<string>('buttons')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data for testing - completely isolated
  const mockConversations = [
    {
      id: '1',
      user: {
        instagram_username: 'mehradworld',
        full_name: 'Mehrad World',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehradworld',
        is_online: true
      },
      last_message_content: 'Hey! How can I help you today? 🛍️',
      last_message_at: new Date().toISOString(),
      unread_count: 3
    },
    {
      id: '2', 
      user: {
        instagram_username: 'sophia.w',
        full_name: 'Sophia Wilson',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
        is_online: false
      },
      last_message_content: 'Thanks for the quick response! ❤️',
      last_message_at: new Date(Date.now() - 3600000).toISOString(),
      unread_count: 0
    },
    {
      id: '3',
      user: {
        instagram_username: 'alex.design',
        full_name: 'Alex Designer',
        profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        is_online: true
      },
      last_message_content: 'Can you send me the design files?',
      last_message_at: new Date(Date.now() - 7200000).toISOString(),
      unread_count: 1
    }
  ]

  // Simple Instagram-style button component
  const InstagramButton = ({ children, variant = 'primary', onClick, className = '' }: {
    children: React.ReactNode
    variant?: 'primary' | 'secondary'
    onClick?: () => void
    className?: string
  }) => {
    const baseClass = 'px-4 py-2 rounded-lg font-medium transition-all duration-200'
    const variants = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
    }
    
    return (
      <button 
        className={`${baseClass} ${variants[variant]} ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    )
  }

  // Simple Instagram-style input component
  const InstagramInput = ({ placeholder, value, onChange, className = '' }: {
    placeholder?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
  }) => {
    return (
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      />
    )
  }

  // Simple search bar component
  const InstagramSearchBar = ({ value, onChange, placeholder = "Search..." }: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }) => {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    )
  }

  // Simple conversation list item component
  const ConversationListItem = ({ conversation, onClick }: {
    conversation: any
    onClick?: () => void
  }) => {
    const timeAgo = new Date(conversation.last_message_at).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    return (
      <div 
        className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
        onClick={onClick}
      >
        <div className="relative">
          <img
            src={conversation.user.profile_picture_url}
            alt={conversation.user.full_name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {conversation.user.is_online && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {conversation.user.full_name}
            </p>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">
              {conversation.last_message_content}
            </p>
            {conversation.unread_count > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                {conversation.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const components = {
    buttons: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Instagram-style Buttons</h3>
        <div className="flex gap-4 flex-wrap">
          <InstagramButton variant="primary">Primary Button</InstagramButton>
          <InstagramButton variant="secondary">Secondary Button</InstagramButton>
          <InstagramButton variant="primary" className="px-6">Wide Button</InstagramButton>
        </div>
        <div className="flex gap-4 flex-wrap">
          <InstagramButton variant="primary" onClick={() => alert('Button clicked!')}>
            Interactive Button
          </InstagramButton>
          <InstagramButton variant="secondary" className="rounded-full">
            Rounded Button
          </InstagramButton>
        </div>
      </div>
    ),
    inputs: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Instagram-style Inputs</h3>
        <InstagramInput placeholder="Enter your message..." />
        <InstagramInput placeholder="Search conversations..." />
        <InstagramInput placeholder="Username" />
        <div className="w-full max-w-md">
          <InstagramSearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search Instagram..."
          />
        </div>
      </div>
    ),
    conversations: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Conversation List</h3>
        <div className="max-w-md border border-gray-200 rounded-lg overflow-hidden">
          {mockConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              onClick={() => alert(`Selected conversation with ${conversation.user.full_name}`)}
            />
          ))}
        </div>
      </div>
    ),
    layout: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Instagram Layout Demo</h3>
        <div className="max-w-md mx-auto border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Messages</h2>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
            <div className="mt-3">
              <InstagramSearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search"
              />
            </div>
          </div>
          
          {/* Conversation List */}
          <div className="divide-y divide-gray-100">
            {mockConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                onClick={() => alert(`Opening chat with ${conversation.user.full_name}`)}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Instagram Components Test</h1>
        <p className="text-gray-600">Desktop-only test page for Instagram-style UI components</p>
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 inline-flex">
          {Object.keys(components).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedComponent(key)}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 capitalize ${
                selectedComponent === key
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {components[selectedComponent as keyof typeof components]}
        </div>
      </div>

      {/* Info */}
      <div className="max-w-6xl mx-auto mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          📌 This is an isolated test page with no external dependencies. 
          All components are self-contained and use mock data only.
        </p>
      </div>
    </div>
  )
}