'use client'

import { useState, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import type { MessageWithStatus } from '@/types'

export function MessageStatusTest() {
  const [testMessages, setTestMessages] = useState<MessageWithStatus[]>([])
  
  useEffect(() => {
    // Create test messages with different statuses
    const messages: MessageWithStatus[] = [
      {
        id: '1',
        conversation_id: 'test-conv',
        sender_id: 'user-1',
        content: 'This message was just sent',
        sent_at: new Date().toISOString(),
        delivered_at: null,
        read_at: null,
        is_admin: false,
        status: 'sent',
        message_type: 'text',
        created_at: new Date().toISOString(),
        sender: {
          id: 'user-1',
          email: 'user@test.com',
          instagram_username: 'testuser',
          full_name: 'Test User',
          profile_picture_url: '',
          role: 'user',
          last_seen: new Date().toISOString(),
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: '2',
        conversation_id: 'test-conv',
        sender_id: 'user-1',
        content: 'This message was delivered to the server',
        sent_at: new Date(Date.now() - 5000).toISOString(),
        delivered_at: new Date(Date.now() - 4000).toISOString(),
        read_at: null,
        is_admin: false,
        status: 'delivered',
        message_type: 'text',
        created_at: new Date(Date.now() - 5000).toISOString(),
        sender: {
          id: 'user-1',
          email: 'user@test.com',
          instagram_username: 'testuser',
          full_name: 'Test User',
          profile_picture_url: '',
          role: 'user',
          last_seen: new Date().toISOString(),
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: '3',
        conversation_id: 'test-conv',
        sender_id: 'user-1',
        content: 'This message was read by the admin',
        sent_at: new Date(Date.now() - 10000).toISOString(),
        delivered_at: new Date(Date.now() - 9000).toISOString(),
        read_at: new Date(Date.now() - 3000).toISOString(),
        is_admin: false,
        status: 'read',
        message_type: 'text',
        created_at: new Date(Date.now() - 10000).toISOString(),
        sender: {
          id: 'user-1',
          email: 'user@test.com',
          instagram_username: 'testuser',
          full_name: 'Test User',
          profile_picture_url: '',
          role: 'user',
          last_seen: new Date().toISOString(),
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: '4',
        conversation_id: 'test-conv',
        sender_id: 'admin-1',
        content: 'Admin response message',
        sent_at: new Date(Date.now() - 2000).toISOString(),
        delivered_at: new Date(Date.now() - 1000).toISOString(),
        read_at: null,
        is_admin: true,
        status: 'delivered',
        message_type: 'text',
        created_at: new Date(Date.now() - 2000).toISOString(),
        sender: {
          id: 'admin-1',
          email: 'admin@test.com',
          instagram_username: '',
          full_name: 'Admin User',
          profile_picture_url: '',
          role: 'admin',
          last_seen: new Date().toISOString(),
          is_online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    ]

    setTestMessages(messages)
  }, [])

  const simulateStatusUpdate = (messageId: string) => {
    setTestMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const now = new Date().toISOString()
        let newStatus: 'sent' | 'delivered' | 'read' = msg.status

        if (msg.status === 'sent') {
          newStatus = 'delivered'
          return { ...msg, delivered_at: now, status: newStatus }
        } else if (msg.status === 'delivered') {
          newStatus = 'read'
          return { ...msg, read_at: now, status: newStatus }
        }
      }
      return msg
    }))
  }

  const testLatencyMeasurement = () => {
    const startTime = performance.now()
    
    // Simulate status update
    setTimeout(() => {
      const endTime = performance.now()
      const latency = endTime - startTime
      console.log(`Status update latency: ${latency.toFixed(2)}ms`)
    }, Math.random() * 50 + 10) // Random latency between 10-60ms
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Message Status Testing</h1>
          <p className="text-gray-600 mb-4">
            Test different message statuses and their visual indicators
          </p>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => simulateStatusUpdate('1')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update Message 1 Status
            </button>
            <button
              onClick={() => simulateStatusUpdate('2')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Update Message 2 Status
            </button>
            <button
              onClick={testLatencyMeasurement}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test Latency
            </button>
          </div>
        </div>

        {/* Status Legend */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <h3 className="font-semibold mb-3">Status Indicators Legend:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">✓</span>
              <span>Sent - Message sent from user</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">✓✓</span>
              <span>Delivered - Message delivered to server</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-tiffany-500">✓✓</span>
              <span>Read - Message read by recipient (blue ticks)</span>
            </div>
          </div>
        </div>

        {/* Test Messages */}
        <div className="space-y-4">
          {testMessages.map((message) => (
            <div key={message.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-2">
                Message ID: {message.id} | Status: {message.status} | From: {message.is_admin ? 'Admin' : 'User'}
              </div>
              <MessageBubble 
                message={message}
                isOwn={!message.is_admin}
                showStatus={true}
                showTimestamp={true}
              />
              <div className="mt-2 text-xs text-gray-400">
                <div>Sent: {new Date(message.sent_at).toLocaleTimeString()}</div>
                {message.delivered_at && (
                  <div>Delivered: {new Date(message.delivered_at).toLocaleTimeString()}</div>
                )}
                {message.read_at && (
                  <div>Read: {new Date(message.read_at).toLocaleTimeString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg p-4 mt-6 shadow-sm">
          <h3 className="font-semibold mb-3">Performance Requirements:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="font-medium text-gray-900">&lt; 100ms</div>
              <div className="text-gray-600">Message Delivery</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="font-medium text-gray-900">&lt; 50ms</div>
              <div className="text-gray-600">Status Updates</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="font-medium text-gray-900">99.9%</div>
              <div className="text-gray-600">Sync Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}