'use client'

import { useEffect, useRef, useState } from 'react'

interface TouchInteractionOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  swipeThreshold?: number
  longPressDelay?: number
}

export function useTouchInteractions(options: TouchInteractionOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    longPressDelay = 500
  } = options

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const touchStartTime = useRef<number | null>(null)
  const lastTapTime = useRef<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const [isTouching, setIsTouching] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    touchStartTime.current = Date.now()
    setIsTouching(true)

    // Long press detection
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        if (isTouching) {
          onLongPress()
          // Haptic feedback simulation
          if ('vibrate' in navigator) {
            navigator.vibrate(50)
          }
        }
      }, longPressDelay)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press if moving
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsTouching(false)

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    if (!touchStartX.current || !touchStartY.current || !touchStartTime.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current
    const deltaTime = Date.now() - touchStartTime.current

    // Swipe detection
    if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    // Double tap detection
    if (onDoubleTap && deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      const currentTime = Date.now()
      if (currentTime - lastTapTime.current < 300) {
        onDoubleTap()
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(30)
        }
      }
      lastTapTime.current = currentTime
    }

    // Reset
    touchStartX.current = null
    touchStartY.current = null
    touchStartTime.current = null
  }

  const touchHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  return {
    touchHandlers,
    isTouching
  }
}

// Pull to refresh hook
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (contentRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY.current || contentRef.current?.scrollTop !== 0) return

    const currentY = e.touches[0].clientY
    const distance = currentY - touchStartY.current

    if (distance > 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance, 150))
      setIsPulling(distance > 80)
    }
  }

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > 80) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(20)
      }
      
      await onRefresh()
    }

    setIsPulling(false)
    setPullDistance(0)
    touchStartY.current = null
  }

  return {
    contentRef,
    isPulling,
    pullDistance,
    pullHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
}