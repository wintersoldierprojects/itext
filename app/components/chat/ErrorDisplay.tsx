'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: Error | null; // Allow null in case error is cleared
  context?: string; // Optional context for the error message
  onRetry?: () => void; // Optional retry callback
}

export function ErrorDisplay({ error, context, onRetry }: ErrorDisplayProps) {
  if (!error) {
    return null; // Don't render anything if there's no error
  }

  const defaultMessage = 'An unexpected error occurred.';
  const errorMessage = error.message || defaultMessage;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg text-center">
      <div className="mb-2">
        <svg className="w-10 h-10 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-700 mb-1">
        {context ? `Error in ${context}` : 'Something went wrong'}
      </h3>
      <p className="text-sm text-red-600 mb-3">
        {errorMessage}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Try Again
        </button>
      )}
      {!onRetry && (
         <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Refresh Page
        </button>
      )}
    </div>
  );
}
