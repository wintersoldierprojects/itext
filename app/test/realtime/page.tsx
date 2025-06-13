'use client'

import { useState } from 'react'

// Completely isolated realtime simulation test page
interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  latency?: number
  error?: string
  timestamp?: Date
}

interface PerformanceMetrics {
  messageDeliveryLatency: number[]
  statusUpdateLatency: number[]
  typingIndicatorLatency: number[]
  connectionLatency: number
}

export default function RealtimeTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    messageDeliveryLatency: [],
    statusUpdateLatency: [],
    typingIndicatorLatency: [],
    connectionLatency: 0
  })
  const [liveUpdates, setLiveUpdates] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')

  // Simulate real-time tests without actual Supabase connection
  const simulateTest = async (testName: string, duration: number): Promise<TestResult> => {
    const startTime = Date.now()
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const latency = Date.now() - startTime
        const success = Math.random() > 0.1 // 90% success rate
        
        resolve({
          name: testName,
          status: success ? 'passed' : 'failed',
          latency,
          error: success ? undefined : 'Simulated network error',
          timestamp: new Date()
        })
      }, duration)
    })
  }

  const addLiveUpdate = (message: string) => {
    setLiveUpdates(prev => [
      `${new Date().toLocaleTimeString()}: ${message}`,
      ...prev.slice(0, 19) // Keep only last 20 updates
    ])
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setMetrics({
      messageDeliveryLatency: [],
      statusUpdateLatency: [],
      typingIndicatorLatency: [],
      connectionLatency: 0
    })
    
    addLiveUpdate('Starting realtime tests...')
    setConnectionStatus('connecting')

    const tests = [
      { name: 'Connection Test', duration: 500 },
      { name: 'Message Delivery', duration: 300 },
      { name: 'Status Updates', duration: 250 },
      { name: 'Typing Indicators', duration: 200 },
      { name: 'Message Reactions', duration: 180 },
      { name: 'Presence Updates', duration: 220 },
      { name: 'Load Test (50 messages)', duration: 1000 },
      { name: 'Network Resilience', duration: 800 }
    ]

    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 300))
    setConnectionStatus('connected')
    addLiveUpdate('✅ Connection established')

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      
      // Update test status to running
      setTestResults(prev => [
        ...prev,
        { ...test, status: 'running' }
      ])
      
      addLiveUpdate(`🧪 Running ${test.name}...`)
      
      // Run the test
      const result = await simulateTest(test.name, test.duration)
      
      // Update results
      setTestResults(prev => prev.map((t, idx) => 
        idx === i ? result : t
      ))

      // Update metrics
      const latency = result.latency || 0
      setMetrics(prev => {
        const newMetrics = { ...prev }
        
        if (test.name.includes('Message')) {
          newMetrics.messageDeliveryLatency.push(latency)
        } else if (test.name.includes('Status')) {
          newMetrics.statusUpdateLatency.push(latency)
        } else if (test.name.includes('Typing')) {
          newMetrics.typingIndicatorLatency.push(latency)
        } else if (test.name.includes('Connection')) {
          newMetrics.connectionLatency = latency
        }
        
        return newMetrics
      })

      if (result.status === 'passed') {
        addLiveUpdate(`✅ ${test.name} passed (${latency}ms)`)
      } else {
        addLiveUpdate(`❌ ${test.name} failed: ${result.error}`)
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    addLiveUpdate('🎉 All tests completed!')
    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return '✅'
      case 'failed': return '❌'
      case 'running': return '🔄'
      default: return '⏳'
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'running': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getAverageLatency = (latencies: number[]) => {
    if (latencies.length === 0) return 0
    return Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="ltr">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Realtime Performance Test</h1>
          <p className="text-gray-600">Simulated real-time messaging performance testing (Isolated environment)</p>
        </div>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-gray-400'
              }`}></div>
              <span className="font-medium">Connection Status: </span>
              <span className={`ml-2 capitalize ${
                connectionStatus === 'connected' ? 'text-green-600' :
                connectionStatus === 'connecting' ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                {connectionStatus}
              </span>
            </div>
            
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running Tests...' : 'Run Performance Tests'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Results */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tests run yet. Click &quot;Run Performance Tests&quot; to start.</p>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{getStatusIcon(result.status)}</span>
                      <div>
                        <p className="font-medium">{result.name}</p>
                        {result.error && (
                          <p className="text-sm text-red-600">{result.error}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-medium ${getStatusColor(result.status)}`}>
                        {result.status.toUpperCase()}
                      </p>
                      {result.latency && (
                        <p className="text-sm text-gray-500">{result.latency}ms</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-900">Message Delivery</span>
                  <span className="text-blue-700 font-mono">
                    {getAverageLatency(metrics.messageDeliveryLatency)}ms avg
                  </span>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  {metrics.messageDeliveryLatency.length} samples
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-900">Status Updates</span>
                  <span className="text-green-700 font-mono">
                    {getAverageLatency(metrics.statusUpdateLatency)}ms avg
                  </span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {metrics.statusUpdateLatency.length} samples
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-900">Typing Indicators</span>
                  <span className="text-purple-700 font-mono">
                    {getAverageLatency(metrics.typingIndicatorLatency)}ms avg
                  </span>
                </div>
                <div className="text-sm text-purple-600 mt-1">
                  {metrics.typingIndicatorLatency.length} samples
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-orange-900">Connection</span>
                  <span className="text-orange-700 font-mono">
                    {metrics.connectionLatency}ms
                  </span>
                </div>
                <div className="text-sm text-orange-600 mt-1">
                  Initial connection time
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Updates */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Live Updates</h2>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
            {liveUpdates.length === 0 ? (
              <div className="text-gray-500">Waiting for test execution...</div>
            ) : (
              liveUpdates.map((update, index) => (
                <div key={index} className="mb-1">
                  {update}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚡ This is a simulated testing environment with no real network calls. 
            All latency and performance metrics are generated for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  )
}
