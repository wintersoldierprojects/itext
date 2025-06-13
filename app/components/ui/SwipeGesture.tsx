'use client'

import { useState, TouchEvent, ReactNode } from 'react'

interface SwipeGestureProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  className?: string
}

export default function SwipeGesture({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className = ''
}: SwipeGestureProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swiping, setSwiping] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)

  const minSwipeDistance = threshold

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setSwiping(true)
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!touchStart) return
    
    const currentTouch = e.targetTouches[0].clientX
    const diff = touchStart - currentTouch
    
    // Only allow horizontal swipes within reasonable bounds
    if (Math.abs(diff) < 200) {
      setSwipeOffset(-diff)
    }
    
    setTouchEnd(currentTouch)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwiping(false)
      setSwipeOffset(0)
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
      // Add haptic feedback for iOS
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
    }
    
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
      // Add haptic feedback for iOS
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
    }

    // Reset states
    setSwiping(false)
    setSwipeOffset(0)
    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <div
      className={`transition-transform duration-150 ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: swiping ? `translateX(${Math.max(-100, Math.min(100, swipeOffset))}px)` : 'translateX(0)'
      }}
    >
      {children}
    </div>
  )
}