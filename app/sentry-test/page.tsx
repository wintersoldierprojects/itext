'use client';

import { useState } from 'react';

export default function SentryTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const triggerFrontendError = () => {
    addResult('Triggering frontend error...');
    try {
      // @ts-ignore - Intentional error for testing
      myUndefinedFunction();
    } catch (error) {
      addResult('Frontend error triggered successfully');
      throw error; // Re-throw to ensure Sentry captures it
    }
  };

  const triggerAPIError = async () => {
    addResult('Triggering API error...');
    try {
      const response = await fetch('/api/sentry-test-error');
      if (!response.ok) {
        addResult('API error triggered successfully');
      }
    } catch (error) {
      addResult('API request failed as expected');
    }
  };

  const triggerPerformanceTest = async () => {
    addResult('Testing performance monitoring...');
    const startTime = performance.now();
    
    // Simulate message sending latency test
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate 50ms operation
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    addResult(`Performance test completed: ${latency.toFixed(2)}ms`);
    
    if (latency > 100) {
      addResult('⚠️ Latency exceeds 100ms target!');
    } else {
      addResult('✅ Latency within 100ms target');
    }
  };

  const triggerChatSpecificError = () => {
    addResult('Triggering chat-specific error...');
    try {
      // Simulate a chat-related error
      const fakeMessage = null;
      // @ts-ignore - Intentional error
      fakeMessage.content.trim();
    } catch (error) {
      addResult('Chat error triggered: Message processing failed');
      throw new Error('CherryGifts Chat: Failed to process message content');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🚀 CherryGifts Chat - Sentry Integration Test
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Test Sentry MCP Server Integration
            </h2>
            <p className="text-gray-600 mb-4">
              Use these buttons to trigger test errors and verify your Sentry MCP server is capturing data.
              Check your Cline interface for real-time monitoring capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={triggerFrontendError}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🔥 Trigger Frontend Error
            </button>

            <button
              onClick={triggerAPIError}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ⚡ Trigger API Error
            </button>

            <button
              onClick={triggerPerformanceTest}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              📊 Test Performance Monitoring
            </button>

            <button
              onClick={triggerChatSpecificError}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              💬 Trigger Chat Error
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Test Results:
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 italic">No tests run yet. Click a button above to start testing.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm text-gray-700 font-mono bg-white p-2 rounded">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              🎯 How to Verify Sentry MCP Integration:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Click the test buttons above to generate errors</li>
              <li>In Cline, ask: <code className="bg-blue-100 px-2 py-1 rounded">"Show me recent errors in CherryGifts"</code></li>
              <li>Use Seer AI: <code className="bg-blue-100 px-2 py-1 rounded">"Use Seer to analyze this error"</code></li>
              <li>Check performance: <code className="bg-blue-100 px-2 py-1 rounded">"Check message delivery latency"</code></li>
            </ol>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              <strong>Project:</strong> tameshk/cherrygifts | 
              <strong> Region:</strong> Germany (de.sentry.io) | 
              <strong> MCP Server:</strong> Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
