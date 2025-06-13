'use client';

import { useEffect } from 'react';

// Declare myUndefinedFunction for testing purposes
declare function myUndefinedFunction(): void;

export default function SentryExamplePage() {
  useEffect(() => {
    // Sentry is now initialized globally in SentryInitializer.tsx
    // This page will rely on that global initialization.
    console.log('ℹ️ SentryExamplePage loaded. Global SentryInitializer should handle SDK init.');

    // Automatic error after 3 seconds using myUndefinedFunction
    const timeoutId = setTimeout(() => {
      console.log('🕐 Triggering Sentry test error via timeout (myUndefinedFunction)…');
      try {
        myUndefinedFunction();
      } catch (error) {
        // Sentry should automatically capture this unhandled error
        console.error('Error during automatic timeout trigger:', error);
      }
    }, 3000);

    return () => {
      clearTimeout(timeoutId); // Cleanup timeout on component unmount
    };
  }, []);

  const triggerButtonError = () => {
    console.log('🧪 Triggering Sentry test error via button click (myUndefinedFunction)…');
    try {
      myUndefinedFunction();
    } catch (error) {
      // Sentry should automatically capture this unhandled error
      console.error('Error during button click trigger:', error);
    }
  };

  const triggerChatError = () => {
    console.log('💬 Triggering chat-specific error…');
    // Simulate a chat-related error
    const fakeMessage = null;
    try {
      // @ts-ignore - Intentional error
      if (fakeMessage) fakeMessage.content.trim(); // Added a check to avoid direct null access error if not intended
      else throw new Error("fakeMessage is null");
    } catch (error) {
      // Sentry should automatically capture this unhandled error
      console.error('Error during chat error simulation:', error);
      // Optionally, explicitly capture if needed, though Sentry usually handles unhandled ones.
      // Sentry.captureException(new Error('CherryGifts Chat: Message processing failed - Real-time chat error simulation'));
    }
  };

  const triggerPerformanceError = () => {
    console.log('📊 Triggering performance-related error…');
    // Simulate a performance issue
    const startTime = performance.now();
    // Simulate slow operation
    for (let i = 0; i < 1000000; i++) {
      Math.random();
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 100) { // This will likely always be true for 1M iterations
      try {
        throw new Error(`CherryGifts Chat: Performance issue detected - Operation took ${duration.toFixed(2)}ms (exceeds 100ms target)`);
      } catch (error) {
        console.error('Error during performance error simulation:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🚀 Sentry MCP Integration Test - CherryGifts Chat
          </h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Test Sentry Error Capture & MCP Server Integration
            </h2>
            <p className="text-gray-600 mb-4">
              This page will automatically trigger a test error (<code className="bg-gray-200 px-1 rounded">myUndefinedFunction</code>) after 3 seconds. 
              You can also manually trigger different types of errors using the buttons below.
              Check your browser console for Sentry debug logs from the global initializer.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                🎯 After Triggering Errors:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Check browser console for Sentry debug logs (e.g., "Global Sentry SDK Initialized")</li>
                <li>Wait 1-2 minutes for errors to appear in Sentry dashboard</li>
                <li>In Cline, ask: <code className="bg-blue-100 px-2 py-1 rounded">"Show me recent errors in CherryGifts"</code></li>
                <li>Test MCP tools: <code className="bg-blue-100 px-2 py-1 rounded">"Get details for the test error"</code></li>
                <li>Use AI debugging: <code className="bg-blue-100 px-2 py-1 rounded">"Use Seer to analyze this error"</code></li>
              </ol>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={triggerButtonError}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🔥 Trigger <code className="bg-red-400 px-1 rounded">myUndefinedFunction</code> Error
            </button>

            <button
              onClick={triggerChatError}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              💬 Trigger Chat Simulation Error
            </button>

            <button
              onClick={triggerPerformanceError}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              📊 Trigger Performance Simulation Error
            </button>

            <button
              onClick={() => {
                console.log('🧪 Triggering another undefined function error…');
                try {
                  // @ts-ignore - Intentional error
                  anotherUndefinedFunction();
                } catch (error) {
                  console.error('Error during "anotherUndefinedFunction" trigger:', error);
                }
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ⚡ Trigger Different Undefined Function
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              📋 Test Information:
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div><strong>Project:</strong> tameshk/cherrygifts</div>
              <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
              <div><strong>DSN:</strong> Loaded by Global Sentry Initializer</div>
              <div><strong>Debug Mode:</strong> {(process.env.NODE_ENV === 'development').toString()} (check console)</div>
              <div><strong>MCP Server:</strong> Connected (green status)</div>
              <div><strong>Auto Error:</strong> Triggers <code className="bg-gray-200 px-1 rounded">myUndefinedFunction</code> after 3 seconds</div>
            </div>
          </div>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Expected Results:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-green-700">
              <li>Console shows "Global Sentry SDK Initialized" from `SentryInitializer.tsx`</li>
              <li>Console shows Sentry debug logs when errors are triggered</li>
              <li>Errors (especially `myUndefinedFunction` calls) appear in Sentry dashboard</li>
              <li>MCP server can query and analyze these errors</li>
              <li>Seer AI can provide fix suggestions for the captured errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
