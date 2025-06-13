'use client'

import { useEffect, useState, RefObject } from 'react'

interface UseIntersectionObserverProps {
  elementRef: RefObject<HTMLElement | null>
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(loadMoreRef: RefObject<HTMLDivElement | null>, p0: {}, {
  elementRef, threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false
}: UseIntersectionObserverProps) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  const frozen = entry?.isIntersecting && freezeOnceVisible

  useEffect(() => {
    const element = elementRef.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !element) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry)
      setIsIntersecting(entry.isIntersecting)
    }, observerParams)

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [elementRef, threshold, root, rootMargin, frozen])

  return { entry, isIntersecting }
}