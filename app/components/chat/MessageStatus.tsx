'use client';

import React from 'react';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: string;
  showTimestamp?: boolean;
  className?: string;
}

export function MessageStatus({ 
  status, 
  timestamp, 
  showTimestamp = true, 
  className = '' 
}: MessageStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border border-instagram-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-instagram-gray-400">Sending...</span>
          </div>
        );
      
      case 'sent':
        return (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-instagram-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {showTimestamp && timestamp && (
              <span className="text-xs text-instagram-gray-400">
                {formatTimestamp(timestamp)}
              </span>
            )}
          </div>
        );
      
      case 'delivered':
        return (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <svg className="w-4 h-4 text-instagram-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-4 h-4 text-instagram-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            {showTimestamp && timestamp && (
              <span className="text-xs text-instagram-gray-400">
                {formatTimestamp(timestamp)}
              </span>
            )}
          </div>
        );
      
      case 'read':
        return (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <svg className="w-4 h-4 text-instagram-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <svg className="w-4 h-4 text-instagram-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            {showTimestamp && timestamp && (
              <span className="text-xs text-instagram-blue">
                {formatTimestamp(timestamp)}
              </span>
            )}
          </div>
        );
      
      case 'failed':
        return (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-red-500">Failed</span>
          </div>
        );
      
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`flex items-center justify-end animate-status-update ${className}`}>
      {getStatusIcon()}
    </div>
  );
}
