'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface UseUserStatusOptions {
  updateInterval?: number; // Heartbeat interval in milliseconds
  activityTimeout?: number; // Time before considering user inactive
}

export function useUserStatus(options: UseUserStatusOptions = {}) {
  const {
    updateInterval = 30000, // 30 seconds
    activityTimeout = 60000, // 1 minute
  } = options;

  const supabase = createClient();
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const activityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivity = useRef<number>(Date.now());
  const isOnline = useRef<boolean>(true);

  // Update user's last_seen and online status
  const updateUserStatus = useCallback(async (online: boolean = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({
          is_online: online,
          last_seen: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to update user status:', error);
      } else {
        isOnline.current = online;
        console.log(`User status updated: ${online ? 'online' : 'offline'}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }, [supabase]);

  // Set user offline
  const setOffline = useCallback(async () => {
    await updateUserStatus(false);
  }, [updateUserStatus]);

  // Set user online
  const setOnline = useCallback(async () => {
    await updateUserStatus(true);
    lastActivity.current = Date.now();
  }, [updateUserStatus]);

  // Track user activity
  const trackActivity = useCallback(() => {
    lastActivity.current = Date.now();
    
    // If user was offline, set them back online
    if (!isOnline.current) {
      setOnline();
    }

    // Reset activity timer
    if (activityTimer.current) {
      clearTimeout(activityTimer.current);
    }

    // Set timer to mark user as inactive after timeout
    activityTimer.current = setTimeout(() => {
      if (isOnline.current) {
        setOffline();
      }
    }, activityTimeout);
  }, [setOnline, setOffline, activityTimeout]);

  // Handle page visibility changes
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page is hidden, set user offline
      setOffline();
    } else {
      // Page is visible, set user online and track activity
      setOnline();
      trackActivity();
    }
  }, [setOffline, setOnline, trackActivity]);

  // Handle beforeunload (page close/refresh)
  const handleBeforeUnload = useCallback(async () => {
    try {
      // Use sendBeacon for reliable offline status update
      const { data: { user } } = await supabase.auth.getUser();
      if (user && navigator.sendBeacon) {
        const payload = JSON.stringify({
          is_online: false,
          last_seen: new Date().toISOString(),
        });
        
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`,
          payload
        );
      }
    } catch (error) {
      console.error('Error in beforeunload:', error);
    }
  }, [supabase]);

  // Start heartbeat to keep status updated
  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    heartbeatInterval.current = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity.current;
      
      // Only send heartbeat if user has been active recently
      if (timeSinceActivity < activityTimeout && isOnline.current) {
        updateUserStatus(true);
      }
    }, updateInterval);
  }, [updateUserStatus, updateInterval, activityTimeout]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  }, []);

  // Initialize user status tracking
  useEffect(() => {
    // Set user online when component mounts
    setOnline();
    
    // Start heartbeat
    startHeartbeat();

    // Activity event listeners
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Add beforeunload listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      // Remove event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Clear timers
      stopHeartbeat();
      if (activityTimer.current) {
        clearTimeout(activityTimer.current);
      }

      // Set user offline
      setOffline();
    };
  }, [
    setOnline,
    setOffline,
    startHeartbeat,
    stopHeartbeat,
    trackActivity,
    handleVisibilityChange,
    handleBeforeUnload,
  ]);

  return {
    setOnline,
    setOffline,
    trackActivity,
    isOnline: isOnline.current,
  };
}

// Hook for monitoring other users' online status
export function useOnlineUsers() {
  const supabase = createClient();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to user status changes
    const channel = supabase
      .channel('user-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: 'is_online=eq.true',
        },
        (payload) => {
          console.log('User status change:', payload);
          // Update online users list
          fetchOnlineUsers();
        }
      )
      .subscribe();

    // Initial fetch
    fetchOnlineUsers();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('is_online', true);

      if (error) throw error;

      setOnlineUsers(data.map(user => user.id));
    } catch (error) {
      console.error('Failed to fetch online users:', error);
    }
  };

  return onlineUsers;
}

// Utility function to check if a user is online
export function useIsUserOnline(userId: string) {
  const onlineUsers = useOnlineUsers();
  return onlineUsers.includes(userId);
}
