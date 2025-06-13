'use client'

import { useState } from 'react'
import { TypingIndicator } from '@/app/components/chat/TypingIndicator'
import type { TypingStatus } from '@/types'

export default function TypingTestPage() {
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [latencyLog, setLatencyLog] = useState<string[]>([])

  const addLatencyLog = (message: string) => {
    setLatencyLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const simulateTyping = (username: string, duration = 3000) => {
    const startTime = performance.now()
    
    // Add typing status
    const typingStatus: TypingStatus = {
      conversationId: 'test-conv',
      userId: `user-${username}`,
      isTyping: true,
      username
    }

    setTypingUsers(prev => {
      const filtered = prev.filter(u => u.userId !== typingStatus.userId)
      return [...filtered, typingStatus]
    })

    addLatencyLog(`${username} started typing (latency: ${(performance.now() - startTime).toFixed(2)}ms)`)

    // Remove after duration
    setTimeout(() => {
      setTypingUsers(prev => prev.filter(u => u.userId !== typingStatus.userId))
      addLatencyLog(`${username} stopped typing (total duration: ${duration}ms)`)
    }, duration)
  }

  const simulateMultipleUsers = () => {
    if (isSimulating) return
    
    setIsSimulating(true)
    addLatencyLog('Starting multi-user typing simulation...')

    // Simulate staggered typing
    setTimeout(() => simulateTyping('sarah_90', 4000), 0)
    setTimeout(() => simulateTyping('mike_design', 3000), 1000)
    setTimeout(() => simulateTyping('admin_support', 2000), 2000)

    setTimeout(() => {
      setIsSimulating(false)
      addLatencyLog('Multi-user simulation completed')
    }, 6000)
  }

  const testPerformance = () => {
    const iterations = 100
    const latencies: number[] = []

    addLatencyLog(`Starting performance test (${iterations} iterations)...`)

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()
      
      // Simulate typing status update
      const typingStatus: TypingStatus = {
        conversationId: 'test-conv',
        userId: `perf-user-${i}`,
        isTyping: true,
        username: `perftest${i}`
      }

      setTypingUsers(prev => [...prev, typingStatus])
      
      const endTime = performance.now()
      latencies.push(endTime - startTime)

      // Clean up immediately
      setTypingUsers(prev => prev.filter(u => u.userId !== typingStatus.userId))
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
    const maxLatency = Math.max(...latencies)
    const minLatency = Math.min(...latencies)

    addLatencyLog(`Performance test completed:`)
    addLatencyLog(`  Average: ${avgLatency.toFixed(2)}ms`)
    addLatencyLog(`  Min: ${minLatency.toFixed(2)}ms, Max: ${maxLatency.toFixed(2)}ms`)
    addLatencyLog(`  Target: <500ms ${avgLatency < 500 ? '✅' : '❌'}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Typing Indicators Testing</h1>
          <p className="text-gray-600">Test real-time typing indicators performance and behavior</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Control Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => simulateTyping('john_doe', 2000)}
                className="w-full py-3 px-4 bg-tiffany-500 text-white rounded-lg font-medium hover:bg-tiffany-600 transition-colors"
              >
                Simulate Single User Typing (2s)
              </button>

              <button
                onClick={() => simulateTyping('admin_sarah', 5000)}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Simulate Admin Typing (5s)
              </button>

              <button
                onClick={simulateMultipleUsers}
                disabled={isSimulating}
                className="w-full py-3 px-4 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSimulating ? '🔄 Running...' : 'Simulate Multiple Users'}
              </button>

              <button
                onClick={testPerformance}
                className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Run Performance Test (100 iterations)
              </button>

              <button
                onClick={() => {
                  setTypingUsers([])
                  setLatencyLog([])
                }}
                className="w-full py-3 px-4 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Current Status */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Currently Typing:</h3>
              {typingUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No one is typing</p>
              ) : (
                <ul className="space-y-1">
                  {typingUsers.map((user) => (
                    <li key={user.userId} className="text-sm text-gray-700">
                      {user.username} (ID: {user.userId})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Visual Test Area */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Typing Indicator Preview</h2>
            
            {/* Chat Interface Mockup */}
            <div className="border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {/* Sample messages */}
                <div className="flex justify-end">
                  <div className="bg-tiffany-500 text-white rounded-lg p-3 max-w-xs">
                    Hey, are you there?
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                    Yes, I&apos;m here! How can I help?
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-tiffany-500 text-white rounded-lg p-3 max-w-xs">
                    I have a question about my order
                  </div>
                </div>

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <TypingIndicator 
                      typingUsers={new Map(typingUsers.map(user => [user.userId, user.isTyping]))}
                      userDetails={new Map(typingUsers.map(user => [user.userId, {
                        user_id: user.userId,
                        username: user.username
                      }]))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-tiffany-600">{typingUsers.length}</div>
                <div className="text-sm text-gray-600">Users Typing</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-tiffany-600">&lt;500ms</div>
                <div className="text-sm text-gray-600">Target Latency</div>
              </div>
            </div>
          </div>
        </div>

        {/* Latency Log */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Log</h2>
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {latencyLog.length === 0 ? (
              <div className="text-gray-500">No logs yet. Run some tests to see performance data...</div>
            ) : (
              latencyLog.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-tiffany-600">&lt;500ms</div>
              <div className="text-sm text-gray-600">Typing Indicator Latency</div>
              <div className="text-xs text-gray-500 mt-1">From input to display</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-tiffany-600">3s</div>
              <div className="text-sm text-gray-600">Auto-timeout</div>
              <div className="text-xs text-gray-500 mt-1">Remove after inactivity</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-tiffany-600">60fps</div>
              <div className="text-sm text-gray-600">Animation Smoothness</div>
              <div className="text-xs text-gray-500 mt-1">Dot animation frame rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
