import { useEffect, useState, useRef, useCallback } from 'react';
import { createAbortableFetch, isFetchError } from '../fetcher';

interface UseFetchOptions {
  enabled?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => void;
}

/**
 * Custom hook for data fetching with automatic cleanup
 * Handles abort on unmount to prevent memory leaks
 * Relies solely on AbortController for lifecycle management (no redundant isMountedRef)
 */
export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { enabled = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const fetcherRef = useRef<ReturnType<typeof createAbortableFetch> | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    if (!url || !enabled) return;

    // Create abort controller for this effect
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchData = async () => {
      // Skip if already aborted
      if (abortController.signal.aborted) return;

      setLoading(true);
      setError(null);

      // Abort any existing fetch before starting a new one
      if (fetcherRef.current) {
        fetcherRef.current.abort();
      }

      // Create new abortable fetcher
      fetcherRef.current = createAbortableFetch();

      try {
        const result = await fetcherRef.current.fetch<T>(url);
        
        // Only update state if not aborted
        if (!abortController.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        // Silently ignore abort/cancellation errors
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        // Also check for wrapped abort errors from our fetcher
        if (isFetchError(err) && err.message.includes('cancelled')) {
          return;
        }
        
        // Only set error if not aborted
        if (!abortController.signal.aborted) {
          setError(err as Error);
        }
      } finally {
        // Only update loading if not aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup: abort fetch on unmount or when deps change
    return () => {
      abortController.abort();
      fetcherRef.current?.abort();
    };
  }, [url, enabled]);

  // Expose refetch function
  const refetch = useCallback(() => {
    if (!url || !enabled) return;
    
    // Abort any existing fetch before starting refetch
    abortControllerRef.current?.abort();
    fetcherRef.current?.abort();
    
    const refetchController = new AbortController();
    abortControllerRef.current = refetchController;
    
    setLoading(true);
    setError(null);

    fetcherRef.current = createAbortableFetch();

    fetcherRef.current.fetch<T>(url)
      .then(result => {
        if (!refetchController.signal.aborted) {
          setData(result);
        }
      })
      .catch(err => {
        const isAbortError = 
          (err instanceof DOMException && err.name === 'AbortError') ||
          (isFetchError(err) && err.message.includes('cancelled'));
        
        if (!isAbortError && !refetchController.signal.aborted) {
          setError(err as Error);
        }
      })
      .finally(() => {
        if (!refetchController.signal.aborted) {
          setLoading(false);
        }
      });
  }, [url, enabled]);

  return {
    data,
    error,
    loading,
    refetch,
  };
}
