'use client'

import { useEffect } from 'react'

interface LocalizationProviderProps {
	children: React.ReactNode
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
	useEffect(() => {
		document.documentElement.dir = 'ltr'
		document.documentElement.lang = 'en'
	}, [])

	return <>{children}</>
}
