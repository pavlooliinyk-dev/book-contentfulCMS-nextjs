import { useEffect, useState, useRef } from 'react';
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
 * Prevents duplicate fetches in React Strict Mode
 */
export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { enabled = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const fetcherRef = useRef<ReturnType<typeof createAbortableFetch>>();
  const abortControllerRef = useRef<AbortController>();
  const isMountedRef = useRef(true);

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
        
        // Only update state if component is still mounted and not aborted
        if (!abortController.signal.aborted && isMountedRef.current) {
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
        if (!abortController.signal.aborted && isMountedRef.current) {
          setError(err as Error);
        }
      } finally {
        // Only update loading if not aborted
        if (!abortController.signal.aborted && isMountedRef.current) {
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

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Expose refetch function
  const refetch = () => {
    if (!url || !enabled) return;
    
    setLoading(true);
    setError(null);

    if (fetcherRef.current) {
      fetcherRef.current.abort();
    }

    fetcherRef.current = createAbortableFetch();

    fetcherRef.current.fetch<T>(url)
      .then(result => {
        if (isMountedRef.current) {
          setData(result);
        }
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (isFetchError(err) && err.message.includes('cancelled')) {
          return;
        }
        if (isMountedRef.current) {
          setError(err as Error);
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setLoading(false);
        }
      });
  };

  return {
    data,
    error,
    loading,
    refetch,
  };
}
