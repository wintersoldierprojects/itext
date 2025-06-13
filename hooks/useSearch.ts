'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import type { ConversationWithUser } from '@/types';

interface UseSearchOptions {
  debounceMs?: number;
  minSearchLength?: number;
}

export function useSearch<T>(
  items: T[],
  searchFields: (keyof T | string)[],
  options: UseSearchOptions = {}
) {
  const { debounceMs = 300, minSearchLength = 1 } = options;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Debounce the search query
  const debouncedQuery = useDebounce(searchQuery, debounceMs);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minSearchLength) {
      return items;
    }

    const query = debouncedQuery.toLowerCase().trim();
    
    return items.filter(item => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [items, searchFields, debouncedQuery, minSearchLength]);

  // Add search to history
  const addToHistory = useCallback((query: string) => {
    if (query.trim() && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  }, [searchHistory]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // Handle search submission
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addToHistory(query);
    }
  }, [addToHistory]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    searchHistory,
    clearSearch,
    clearHistory,
    handleSearch,
    isSearching: debouncedQuery.length >= minSearchLength,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length,
  };
}

// Hook specifically for conversation search
export function useConversationSearch(conversations: ConversationWithUser[]) {
  return useSearch(conversations, [
    'user.instagram_username',
    'user.full_name',
    'last_message_content',
  ], {
    debounceMs: 300,
    minSearchLength: 1,
  });
}

// Hook for message search within a conversation
export function useMessageSearch(messages: any[]) {
  return useSearch(messages, [
    'content',
    'sender.instagram_username',
    'sender.full_name',
  ], {
    debounceMs: 200,
    minSearchLength: 2,
  });
}

// Utility function to get nested object values
function getNestedValue(obj: any, path: string | number | symbol): any {
  if (typeof path === 'string' && path.includes('.')) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
  return obj && obj[path] !== undefined ? obj[path] : undefined;
}

// Utility function to highlight search matches
export function highlightSearchMatch(text: string, query: string): string {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}

// Escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
