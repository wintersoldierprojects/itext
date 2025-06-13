'use client'

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface InstagramSearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

export default function InstagramSearchBar({ 
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
    <div className="px-4 py-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-instagram-gray-400" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 bg-instagram-gray-100 border-none rounded-lg text-instagram-black placeholder-instagram-gray-400 focus:outline-none focus:ring-0 text-base font-normal leading-normal"
          style={{
            fontFamily: '"Spline Sans", "Noto Sans", sans-serif'
          }}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 text-instagram-gray-400 hover:text-instagram-gray-600 transition-colors" />
          </button>
        )}
      </div>
    </div>
  )
}