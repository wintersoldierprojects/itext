'use client'

import { useState, useEffect, ReactNode } from 'react'

interface ResponsiveLayoutProps {
  children: ReactNode
  mobileBreakpoint?: number
  className?: string
}

export default function ResponsiveLayout({
  children,
  mobileBreakpoint = 768,
  className = ''
}: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setScreenWidth(width)
      setIsMobile(width < mobileBreakpoint)
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [mobileBreakpoint])

  // Provide screen size context to children
  const contextValue = {
    isMobile,
    screenWidth,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
    orientation: typeof window !== 'undefined' 
      ? window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      : 'portrait'
  }

  return (
    <div 
      className={`responsive-layout ${isMobile ? 'mobile' : 'desktop'} ${className}`}
      data-screen-width={screenWidth}
      style={{
        '--screen-width': `${screenWidth}px`,
        '--vh': '1vh', // For mobile viewport height issues
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

// Custom hook for responsive behavior
export function useResponsive(mobileBreakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false)
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setScreenWidth(width)
      setIsMobile(width < mobileBreakpoint)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [mobileBreakpoint])

  return {
    isMobile,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
    screenWidth,
    orientation: typeof window !== 'undefined' 
      ? window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      : 'portrait'
  }
}