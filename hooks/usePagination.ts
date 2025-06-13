'use client';

import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
) {
  const { pageSize = 50, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calculate pagination data
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Get current page items
  const currentItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const goToFirst = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLast = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  // Check states
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return {
    // Data
    currentItems,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    startIndex,
    endIndex,
    
    // Navigation
    goToPage,
    nextPage,
    prevPage,
    goToFirst,
    goToLast,
    
    // States
    hasNext,
    hasPrev,
    isFirst,
    isLast,
  };
}

// Hook for infinite scroll pagination
export function useInfiniteScroll<T>(
  items: T[],
  options: { pageSize?: number; threshold?: number } = {}
) {
  const { pageSize = 50, threshold = 0.8 } = options;
  const [loadedCount, setLoadedCount] = useState(pageSize);

  // Get currently loaded items
  const loadedItems = useMemo(() => {
    return items.slice(0, loadedCount);
  }, [items, loadedCount]);

  // Load more items
  const loadMore = useCallback(() => {
    const newCount = Math.min(loadedCount + pageSize, items.length);
    setLoadedCount(newCount);
  }, [loadedCount, pageSize, items.length]);

  // Check if we can load more
  const hasMore = loadedCount < items.length;

  // Scroll handler for infinite loading
  const handleScroll = useCallback((element: HTMLElement) => {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage >= threshold && hasMore) {
      loadMore();
    }
  }, [threshold, hasMore, loadMore]);

  // Reset pagination when items change
  const reset = useCallback(() => {
    setLoadedCount(pageSize);
  }, [pageSize]);

  return {
    loadedItems,
    loadedCount,
    totalCount: items.length,
    hasMore,
    loadMore,
    handleScroll,
    reset,
  };
}
