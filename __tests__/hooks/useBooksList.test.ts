import { renderHook, act } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBooksList } from '@/app/_components/book-list/useBooksList'
import { Book } from '@/lib/types'

// Mock Next.js navigation
jest.mock('next/navigation')

// Mock useInfiniteScroll
jest.mock('@/app/_components/book-list/useInfiniteScroll', () => ({
  useInfiniteScroll: jest.fn(() => jest.fn()),
}))

describe('useBooksList', () => {
  const mockPush = jest.fn()
  const mockGet = jest.fn()
  const mockToString = jest.fn(() => '')
  
  const mockBooks: Book[] = [
    {
      title: 'Book 1',
      slug: 'book-1',
      authors: ['Author 1'],
      taxonomies: [],
      sys: { id: '1' },
    },
    {
      title: 'Book 2',
      slug: 'book-2',
      authors: ['Author 2'],
      taxonomies: [],
      sys: { id: '2' },
    },
  ]

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    })
    
    ;(useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
      toString: mockToString,
    })

    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with initial books and total', () => {
    const { result } = renderHook(() =>
      useBooksList(mockBooks, 2, 5)
    )

    expect(result.current.books).toEqual(mockBooks)
    expect(result.current.total).toBe(2)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle filter change', async () => {
    const mockResponse = {
      items: [mockBooks[0]],
      total: 1,
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() =>
      useBooksList(mockBooks, 2, 5)
    )

    const mockTaxonomy = {
      sys: { id: 'tax-1' },
      title: 'Fiction',
      slug: 'fiction',
      type: 'genre',
    }

    await act(async () => {
      result.current.handleFilterChange(mockTaxonomy)
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('taxonomies=Fiction'),
        expect.any(Object)
      )
    })
  })

  it('should clear filters', async () => {
    // Mock URL to have existing filters
    mockGet.mockReturnValue('Fiction')
    mockToString.mockReturnValue('taxonomies=Fiction')
    
    const mockResponse = {
      items: mockBooks,
      total: 2,
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() =>
      useBooksList(mockBooks, 2, 5, ['Fiction'])
    )

    expect(result.current.selectedTaxIds).toEqual(['Fiction'])

    await act(async () => {
      result.current.clearFilters()
    })

    await waitFor(() => {
      expect(result.current.selectedTaxIds).toEqual([])
      expect(mockPush).toHaveBeenCalled()
    })
  })

  it('should toggle pagination mode', async () => {
    const mockResponse = {
      items: mockBooks,
      total: 2,
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() =>
      useBooksList(mockBooks, 2, 5)
    )

    expect(result.current.isInfinite).toBe(true)

    await act(async () => {
      result.current.togglePagination()
    })

    await waitFor(() => {
      expect(result.current.isInfinite).toBe(false)
    })
  })

  it('should handle page navigation', async () => {
    const mockResponse = {
      items: mockBooks,
      total: 10,
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() =>
      useBooksList(mockBooks, 10, 5)
    )

    await act(async () => {
      result.current.goToPage(1) // Next page
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('skip=5'),
        expect.any(Object)
      )
    })
  })

  it('should deduplicate books by slug', async () => {
    const duplicateBooks = [
      ...mockBooks,
      { ...mockBooks[0], sys: { id: '3' } }, // Duplicate with different ID
    ]

    const mockResponse = {
      items: duplicateBooks,
      total: 2,
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() =>
      useBooksList([], 0, 5)
    )

    // Trigger a fetch
    await act(async () => {
      result.current.clearFilters()
    })

    await waitFor(() => {
      // Should only have 2 unique books, not 3
      expect(result.current.books).toHaveLength(2)
    })
  })

  it('should handle fetch errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    const { result } = renderHook(() =>
      useBooksList(mockBooks, 2, 5)
    )

    await act(async () => {
      result.current.clearFilters()
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })

  it('should abort fetch on unmount', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort')
    
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({ items: [], total: 0 }) }), 1000))
    )

    const { result, unmount } = renderHook(() =>
      useBooksList(mockBooks, 2, 5)
    )

    // Trigger a fetch before unmounting
    act(() => {
      result.current.goToPage(1)
    })

    // Unmount while fetch is in progress
    act(() => {
      unmount()
    })

    expect(abortSpy).toHaveBeenCalled()
    abortSpy.mockRestore()
  })

  it('should handle abort errors gracefully', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
    
    ;(global.fetch as jest.Mock).mockRejectedValue(
      new DOMException('Aborted', 'AbortError')
    )

    const { result } = renderHook(() =>
      useBooksList(mockBooks, 2, 5)
    )

    await act(async () => {
      result.current.clearFilters()
    })

    await waitFor(() => {
      expect(result.current.error).toBeNull() // Should not set error for abort
    })

    consoleDebugSpy.mockRestore()
  })

  it('should update URL only when filters actually change', async () => {
    // Mock URL to have existing filter
    mockGet.mockReturnValue('Fiction')
    mockToString.mockReturnValue('taxonomies=Fiction')
    
    const mockResponse = {
      items: mockBooks,
      total: 2,
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })
    
    const { result } = renderHook(() =>
      useBooksList(mockBooks, 2, 5, ['Fiction'])
    )

    const mockTaxonomy = {
      sys: { id: 'tax-1' },
      title: 'Fiction',
      slug: 'fiction',
      type: 'genre',
    }

    // Clicking the same filter again should remove it
    await act(async () => {
      result.current.handleFilterChange(mockTaxonomy)
    })

    await waitFor(() => {
      expect(result.current.selectedTaxIds).toEqual([])
      expect(mockPush).toHaveBeenCalled()
    })
  })
})
