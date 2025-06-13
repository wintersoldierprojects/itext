'use client'

import { useEffect } from 'react'
import { isPersianPage } from '@/lib/persian-pages'

interface LocalizationProviderProps {
  children: React.ReactNode
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  useEffect(() => {
    // Update document direction and language based on current page
    const updateDocumentDirection = () => {
      const isPerPage = isPersianPage()
      
      document.documentElement.dir = isPerPage ? 'rtl' : 'ltr'
      document.documentElement.lang = isPerPage ? 'fa' : 'en'
      
      // Update meta charset for Persian support
      const metaCharset = document.querySelector('meta[charset]')
      if (metaCharset) {
        metaCharset.setAttribute('charset', 'UTF-8')
      }
    }
    
    updateDocumentDirection()
    
    // Listen for navigation changes to update direction
    const handleNavigation = () => {
      setTimeout(updateDocumentDirection, 0) // Allow URL to update first
    }
    
    // Listen for both popstate and custom navigation events
    window.addEventListener('popstate', handleNavigation)
    window.addEventListener('pushstate', handleNavigation)
    
    return () => {
      window.removeEventListener('popstate', handleNavigation)
      window.removeEventListener('pushstate', handleNavigation)
    }
  }, [])

  return <>{children}</>
}