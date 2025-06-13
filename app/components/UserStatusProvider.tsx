'use client';

import { useEffect } from 'react';
import { useUserStatus } from '@/hooks/useUserStatus';

interface UserStatusProviderProps {
  children: React.ReactNode;
}

export function UserStatusProvider({ children }: UserStatusProviderProps) {
  // Initialize user status tracking with default options
  const { setOnline, setOffline, trackActivity } = useUserStatus({
    updateInterval: 30000, // 30 seconds heartbeat
    activityTimeout: 60000, // 1 minute before marking inactive
  });

  // The useUserStatus hook handles all the setup automatically
  // This component just ensures it's initialized at the app level

  return <>{children}</>;
}
