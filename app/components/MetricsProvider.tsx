'use client'

import { useEffect } from 'react'
import { MetricsCapture } from '@/lib/metrics/error-capture'

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      MetricsCapture.getInstance();
    }
  }, []);

  return <>{children}</>;
}
