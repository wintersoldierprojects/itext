'use client';

/**
 * Time utility functions for message timestamps
 */

export interface TimeFormatOptions {
  showSeconds?: boolean;
  use24Hour?: boolean;
  showDate?: boolean;
  relative?: boolean;
}

/**
 * Formats a timestamp for display in messages
 */
export function formatMessageTime(timestamp: string | Date, options: TimeFormatOptions = {}): string {
  const {
    showSeconds = false,
    use24Hour = false,
    showDate = false,
    relative = true
  } = options;

  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // If relative time is requested and within reasonable range
  if (relative) {
    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
  }

  // Format time
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24Hour
  };

  if (showSeconds) {
    timeOptions.second = '2-digit';
  }

  const timeString = date.toLocaleTimeString('en-US', timeOptions);

  // Add date if requested or if older than a week
  if (showDate || diffInDays >= 7) {
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };

    // Add year if different from current year
    if (date.getFullYear() !== now.getFullYear()) {
      dateOptions.year = 'numeric';
    }

    const dateString = date.toLocaleDateString('en-US', dateOptions);
    return `${dateString}, ${timeString}`;
  }

  return timeString;
}

/**
 * Formats a timestamp for hover tooltips (full date and time)
 */
export function formatFullTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

/**
 * Determines if two timestamps are on the same day
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Determines if two timestamps are within a certain time window (for message grouping)
 */
export function isWithinTimeWindow(date1: string | Date, date2: string | Date, windowMs: number = 60000): boolean {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  
  return Math.abs(d1 - d2) <= windowMs;
}

/**
 * Gets a date separator string for message lists
 */
export function getDateSeparator(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, now)) {
    return 'Today';
  } else if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  } else {
    // Check if it's within the current week
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }
}

/**
 * Checks if a timestamp should show a time indicator (for message grouping)
 */
export function shouldShowTimestamp(
  currentMessage: string | Date,
  previousMessage?: string | Date,
  timeWindowMs: number = 300000 // 5 minutes
): boolean {
  if (!previousMessage) return true;
  
  return !isWithinTimeWindow(currentMessage, previousMessage, timeWindowMs);
}

/**
 * Gets relative time string (e.g., "2 minutes ago", "Yesterday")
 */
export function getRelativeTime(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

/**
 * Updates relative timestamps (useful for periodic updates)
 */
export function createTimestampUpdater(
  updateCallback: () => void,
  intervalMs: number = 60000 // 1 minute
): () => void {
  const interval = setInterval(updateCallback, intervalMs);
  
  return () => clearInterval(interval);
}

/**
 * Formats time for different contexts
 */
export const TimeFormat = {
  // For message bubbles (short format)
  message: (timestamp: string | Date) => formatMessageTime(timestamp, { relative: true }),
  
  // For conversation list (last message time)
  conversation: (timestamp: string | Date) => formatMessageTime(timestamp, { relative: true }),
  
  // For hover tooltips (full format)
  tooltip: (timestamp: string | Date) => formatFullTimestamp(timestamp),
  
  // For date separators
  separator: (timestamp: string | Date) => getDateSeparator(timestamp),
  
  // For relative descriptions
  relative: (timestamp: string | Date) => getRelativeTime(timestamp)
};
