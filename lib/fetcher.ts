/**
 * Centralized fetch utility with error handling, retries, and abort support
 */

export interface FetchError extends Error {
  status?: number;
  data?: any;
  isFetchError: true;
}

export function createFetchError(
  message: string,
  status?: number,
  data?: any
): FetchError {
  const error = new Error(message) as FetchError;
  error.name = 'FetchError';
  error.status = status;
  error.data = data;
  error.isFetchError = true;
  return error;
}

export function isFetchError(error: unknown): error is FetchError {
  return (
    error instanceof Error &&
    'isFetchError' in error &&
    error.isFetchError === true
  );
}

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Enhanced fetch with automatic retries, timeout, and proper error handling
 */
export async function fetcher<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  // Validate URL
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL: URL must be a non-empty string');
  }

  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;

  try {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        if (!response.ok) {
          let errorData = null;
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          // Try to parse error response
          try {
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              errorData = await response.json();
              errorMessage = errorData?.error || errorData?.message || errorMessage;
            }
          } catch (parseError) {
            // If JSON parsing fails, use default message
            console.warn('Failed to parse error response:', parseError);
          }

          throw createFetchError(errorMessage, response.status, errorData);
        }

        // Parse successful response
        try {
          return await response.json();
        } catch (parseError) {
          throw new Error('Failed to parse response as JSON');
        }
      } catch (error) {
        lastError = error as Error;

        // Handle timeout/abort errors
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw createFetchError('Request timeout', 408);
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          lastError = createFetchError('Network error: Unable to reach server', 0);
        }

        // Don't retry on 4xx client errors
        if (isFetchError(error) && error.status && error.status >= 400 && error.status < 500) {
          break;
        }

        // Wait before retrying (except on last attempt)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Fetch failed after multiple retries');
  } finally {
    // Always clear timeout to prevent memory leak
    clearTimeout(timeoutId);
  }
}

/**
 * Hook-friendly fetcher that returns abort function
 */
export function createAbortableFetch() {
  const controller = new AbortController();
  
  const fetch = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL: URL must be a non-empty string');
    }

    try {
      const response = await window.fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorData = null;
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        // Try to parse error response
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            errorData = await response.json();
            errorMessage = errorData?.error || errorData?.message || errorMessage;
          }
        } catch (parseError) {
          // If JSON parsing fails, use default message
          console.warn('Failed to parse error response:', parseError);
        }

        throw createFetchError(errorMessage, response.status, errorData);
      }

      // Parse successful response
      try {
        return await response.json();
      } catch (parseError) {
        throw new Error('Failed to parse response as JSON');
      }
    } catch (error) {
      // Handle abort errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw createFetchError('Request was cancelled', 0);
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw createFetchError('Network error: Unable to reach server', 0);
      }

      // Re-throw other errors
      throw error;
    }
  };

  return {
    fetch,
    abort: () => controller.abort(),
  };
}
