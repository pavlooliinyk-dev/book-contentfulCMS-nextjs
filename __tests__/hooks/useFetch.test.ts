import { renderHook, act } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import { useFetch } from '@/lib/hooks/useFetch'
import { createAbortableFetch } from '@/lib/fetcher'

// Mock the fetcher module
jest.mock('@/lib/fetcher', () => ({
  createAbortableFetch: jest.fn(),
  isFetchError: jest.fn((error) => error && 'isFetchError' in error),
}))

describe('useFetch', () => {
  let mockFetch: jest.Mock
  let mockAbort: jest.Mock

  beforeEach(() => {
    mockFetch = jest.fn()
    mockAbort = jest.fn()
    
    ;(createAbortableFetch as jest.Mock).mockReturnValue({
      fetch: mockFetch,
      abort: mockAbort,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    mockFetch.mockResolvedValue(mockData)

    const { result } = renderHook(() => useFetch('/api/test'))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
    expect(mockFetch).toHaveBeenCalledWith('/api/test')
  })

  it('should handle fetch errors', async () => {
    const mockError = new Error('Network error')
    mockFetch.mockRejectedValue(mockError)

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toEqual(mockError)
  })

  it('should not fetch when url is null', () => {
    const { result } = renderHook(() => useFetch(null))

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(() =>
      useFetch('/api/test', { enabled: false })
    )

    expect(result.current.loading).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should abort fetch on unmount', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: 'test' }), 1000))
    )

    const { unmount } = renderHook(() => useFetch('/api/test'))

    unmount()

    await waitFor(() => {
      expect(mockAbort).toHaveBeenCalled()
    })
  })

  it('should abort previous fetch when url changes', async () => {
    mockFetch.mockResolvedValue({ data: 'test1' })

    const { rerender } = renderHook(
      ({ url }) => useFetch(url),
      { initialProps: { url: '/api/test1' } }
    )

    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/test1'))

    mockFetch.mockResolvedValue({ data: 'test2' })
    rerender({ url: '/api/test2' })

    await waitFor(() => {
      expect(mockAbort).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith('/api/test2')
    })
  })

  it('should ignore abort errors', async () => {
    const abortError = new DOMException('Aborted', 'AbortError')
    mockFetch.mockRejectedValue(abortError)

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should not set error for abort errors
    expect(result.current.error).toBeNull()
  })

  it('should ignore cancelled fetch errors', async () => {
    const cancelledError = { 
      message: 'Request was cancelled',
      isFetchError: true 
    }
    mockFetch.mockRejectedValue(cancelledError)

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should not set error for cancelled errors
    expect(result.current.error).toBeNull()
  })

  it('should provide refetch function', async () => {
    const mockData1 = { id: 1, name: 'Test1' }
    const mockData2 = { id: 2, name: 'Test2' }
    
    mockFetch
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2)

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1)
    })

    // Call refetch
    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2)
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should abort previous fetch when refetch is called', async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: 'test' }), 100))
    )

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))

    // Call refetch before first fetch completes
    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(mockAbort).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('should not update state if aborted during refetch', async () => {
    const mockData = { id: 1, name: 'Test' }

    mockFetch.mockImplementation(async () => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 10))
      return mockData
    })

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => expect(result.current.data).toEqual(mockData))

    // Start refetch and abort immediately
    act(() => {
      result.current.refetch()
      mockAbort()
    })

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 50))

    // Data should still be the original
    expect(result.current.data).toEqual(mockData)
  })

  it('should handle multiple sequential refetches', async () => {
    mockFetch
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 2 })
      .mockResolvedValueOnce({ id: 3 })

    const { result } = renderHook(() => useFetch('/api/test'))

    await waitFor(() => expect(result.current.data).toEqual({ id: 1 }))

    act(() => {
      result.current.refetch()
    })
    await waitFor(() => expect(result.current.data).toEqual({ id: 2 }))

    act(() => {
      result.current.refetch()
    })
    await waitFor(() => expect(result.current.data).toEqual({ id: 3 }))

    expect(mockFetch).toHaveBeenCalledTimes(3)
  })
})
