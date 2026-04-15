"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  enabled: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  rootMargin?: string;
}

/**
 * Optimized custom hook for infinite scroll using IntersectionObserver.
 * @param options - Configuration options
 * @returns A ref callback to attach to the sentinel element
 */
export function useInfiniteScroll({
  enabled,
  onLoadMore,
  hasMore,
  loading,
  rootMargin = "100px",
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  // Store latest values in refs to avoid recreating observer
  const onLoadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  
  // Keep refs in sync with props
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);
  
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  
  // Create observer only once when enabled changes
  useEffect(() => {
    if (!enabled) {
      // Cleanup if disabled
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }
    
    // Create observer only if it doesn't exist
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          
          // Use refs to get latest values without recreating observer
          if (
            entry.isIntersecting &&
            !loadingRef.current &&
            hasMoreRef.current
          ) {
            onLoadMoreRef.current();
          }
        },
        { rootMargin }
      );
      
      // If sentinel element was already attached, observe it now
      if (sentinelRef.current) {
        observerRef.current.observe(sentinelRef.current);
      }
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [enabled, rootMargin]); // Only recreate if enabled or rootMargin changes
  
  // Ref callback to observe/unobserve the sentinel element
  const setSentinelRef = useCallback((node: HTMLDivElement | null) => {
    // Unobserve previous element
    if (sentinelRef.current && observerRef.current) {
      observerRef.current.unobserve(sentinelRef.current);
    }
    
    sentinelRef.current = node;
    
    // Observe new element
    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []); // No dependencies - stable function
  
  return setSentinelRef;
}
