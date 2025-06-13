'use client'

import { useState, useRef, ReactNode, TouchEvent } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
  disabled?: boolean
  className?: string
}

export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  disabled = false,
  className = ''
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return
    
    const container = containerRef.current
    if (!container || container.scrollTop > 0) return
    
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || isRefreshing || startY === null) return
    
    const container = containerRef.current
    if (!container || container.scrollTop > 0) return
    
    const currentY = e.touches[0].clientY
    const diff = currentY - startY
    
    if (diff > 0) {
      e.preventDefault()
      setPullDistance(Math.min(diff * 0.5, threshold + 20))
    }
  }

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing || startY === null) return
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(20)
      }
      
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setPullDistance(0)
    setStartY(null)
  }

  const pullProgress = Math.min(pullDistance / threshold, 1)
  const shouldTrigger = pullDistance >= threshold

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isRefreshing ? 'translateY(60px)' : `translateY(${Math.min(pullDistance, threshold)}px)`,
        transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease' : 'none'
      }}
    >
      {/* Pull to refresh indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-instagram-gray-50 border-b border-instagram-gray-200"
        style={{
          height: '60px',
          transform: 'translateY(-60px)',
          opacity: pullDistance > 10 ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div 
            className={`transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: `rotate(${pullProgress * 180}deg)`
            }}
          >
            <ArrowPathIcon className={`w-6 h-6 ${
              shouldTrigger ? 'text-instagram-blue' : 'text-instagram-gray-400'
            }`} />
          </div>
          <span className={`text-sm font-medium ${
            shouldTrigger ? 'text-instagram-blue' : 'text-instagram-gray-400'
          }`}>
            {isRefreshing ? 'Refreshing...' : shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>
      
      {children}
    </div>
  )
}