'use client'

import React from 'react'

interface InstagramSearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

/**
 * Phase 8: Instagram Admin Dashboard Search Bar
 * 
 * Features implemented:
 * - Round gray input with magnifying glass icon
 * - Instagram-style placeholder text
 * - Clear button when text is entered
 * - Exact Instagram color matching
 * - Responsive design
 */
export default function InstagramSearchBarPhase8({ 
  placeholder = "Search", 
  value, 
  onChange, 
  onClear 
}: InstagramSearchBarProps) {
  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className="p-4 border-b border-instagram-gray-200">
      <div className="relative">
        {/* Magnifying Glass Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-instagram-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        {/* Instagram Search Input */}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 bg-instagram-gray-100 border-none rounded-ig-md text-ig-base text-instagram-black placeholder-instagram-gray-400 focus:outline-none focus:bg-instagram-gray-200 transition-ig"
          style={{
            fontFamily: '"Spline Sans", "Noto Sans", sans-serif'
          }}
        />
        
        {/* Clear Button */}
        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-instagram-gray-50 rounded-full transition-ig"
            type="button"
          >
            <svg 
              className="h-4 w-4 text-instagram-gray-400 hover:text-instagram-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}