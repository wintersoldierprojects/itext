'use client';

import React from 'react';
import { extractDomain, createSafeLink } from '@/lib/linkDetection';

interface LinkPreviewProps {
  url: string;
  displayText: string;
  className?: string;
}

export function LinkPreview({ url, displayText, className = '' }: LinkPreviewProps) {
  const safeLink = createSafeLink(url);
  const domain = extractDomain(url);

  return (
    <div className={`border border-instagram-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
      <a
        href={safeLink.href}
        target={safeLink.target}
        rel={safeLink.rel}
        className="block hover:bg-instagram-gray-50 transition-colors"
      >
        <div className="p-3">
          {/* Link Icon */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-instagram-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-instagram-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Domain */}
              <div className="text-xs text-instagram-gray-500 uppercase tracking-wide font-medium mb-1">
                {domain}
              </div>
              
              {/* URL Display */}
              <div className="text-sm text-instagram-blue font-medium truncate">
                {displayText}
              </div>
              
              {/* Description */}
              <div className="text-xs text-instagram-gray-500 mt-1">
                Click to open link
              </div>
            </div>
            
            {/* External Link Icon */}
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 text-instagram-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}
