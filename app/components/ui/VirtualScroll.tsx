'use client'

import { useState, useRef, useMemo, ReactNode } from 'react'

interface VirtualScrollProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => ReactNode
  overscan?: number
  className?: string
}

export default function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const containerHeightValue = containerHeight
    const itemHeightValue = itemHeight

    // Calculate which items should be visible
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeightValue) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeightValue) / itemHeightValue) + overscan
    )

    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }))

    return {
      visibleItems,
      totalHeight: items.length * itemHeightValue,
      offsetY: startIndex * itemHeightValue
    }
  }, [scrollTop, items, itemHeight, containerHeight, overscan])

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto momentum-scroll ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{ 
                height: itemHeight,
                overflow: 'hidden'
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}