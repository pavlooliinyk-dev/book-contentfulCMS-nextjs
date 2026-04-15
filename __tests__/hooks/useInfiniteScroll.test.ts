import { renderHook } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import { useInfiniteScroll } from '@/app/_components/book-list/useInfiniteScroll'

describe('useInfiniteScroll', () => {
  let mockObserve: jest.Mock
  let mockDisconnect: jest.Mock
  let mockUnobserve: jest.Mock
  let observerCallback: IntersectionObserverCallback

  beforeEach(() => {
    mockObserve = jest.fn()
    mockDisconnect = jest.fn()
    mockUnobserve = jest.fn()

    // Mock IntersectionObserver with callback capture
    global.IntersectionObserver = jest.fn((callback, options) => {
      observerCallback = callback
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        unobserve: mockUnobserve,
        root: null,
        rootMargin: options?.rootMargin || '',
        thresholds: [],
        takeRecords: () => [],
      }
    }) as any
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create IntersectionObserver when enabled', () => {
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        onLoadMore: jest.fn(),
        hasMore: true,
        loading: false,
      })
    )

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: '100px' }
    )
  })

  it('should not create IntersectionObserver when disabled', () => {
    renderHook(() =>
      useInfiniteScroll({
        enabled: false,
        onLoadMore: jest.fn(),
        hasMore: true,
        loading: false,
      })
    )

    expect(global.IntersectionObserver).not.toHaveBeenCalled()
  })

  it('should disconnect observer on unmount', () => {
    const { unmount } = renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        onLoadMore: jest.fn(),
        hasMore: true,
        loading: false,
      })
    )

    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('should call onLoadMore when intersecting and hasMore is true', () => {
    const mockLoadMore = jest.fn()
    
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        onLoadMore: mockLoadMore,
        hasMore: true,
        loading: false,
      })
    )

    // Simulate intersection
    const mockEntry: Partial<IntersectionObserverEntry> = {
      isIntersecting: true,
      target: document.createElement('div'),
      intersectionRatio: 1,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    }

    observerCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)

    expect(mockLoadMore).toHaveBeenCalledTimes(1)
  })

  it('should not call onLoadMore when loading is true', () => {
    const mockLoadMore = jest.fn()
    
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        onLoadMore: mockLoadMore,
        hasMore: true,
        loading: true, // loading = true
      })
    )

    // Simulate intersection
    const mockEntry: Partial<IntersectionObserverEntry> = {
      isIntersecting: true,
      target: document.createElement('div'),
      intersectionRatio: 1,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    }

    observerCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)

    expect(mockLoadMore).not.toHaveBeenCalled()
  })

  it('should not call onLoadMore when hasMore is false', () => {
    const mockLoadMore = jest.fn()
    
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        onLoadMore: mockLoadMore,
        hasMore: false, // hasMore = false
        loading: false,
      })
    )

    // Simulate intersection
    const mockEntry: Partial<IntersectionObserverEntry> = {
      isIntersecting: true,
      target: document.createElement('div'),
      intersectionRatio: 1,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    }

    observerCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)

    expect(mockLoadMore).not.toHaveBeenCalled()
  })

  it('should not call onLoadMore when not intersecting', () => {
    const mockLoadMore = jest.fn()
    
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        onLoadMore: mockLoadMore,
        hasMore: true,
        loading: false,
      })
    )

    // Simulate NOT intersecting
    const mockEntry: Partial<IntersectionObserverEntry> = {
      isIntersecting: false, // Not intersecting
      target: document.createElement('div'),
      intersectionRatio: 0,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    }

    observerCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)

    expect(mockLoadMore).not.toHaveBeenCalled()
  })

  it('should observe element when ref is set', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        onLoadMore: jest.fn(),
        hasMore: true,
        loading: false,
      })
    )

    const mockElement = document.createElement('div')
    result.current(mockElement)

    expect(mockObserve).toHaveBeenCalledWith(mockElement)
  })

  it('should unobserve previous element when ref changes', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        onLoadMore: jest.fn(),
        hasMore: true,
        loading: false,
      })
    )

    const element1 = document.createElement('div')
    const element2 = document.createElement('div')

    result.current(element1)
    result.current(element2)

    expect(mockUnobserve).toHaveBeenCalledWith(element1)
    expect(mockObserve).toHaveBeenCalledWith(element2)
  })

  it('should use custom rootMargin', () => {
    renderHook(() =>
      useInfiniteScroll({
        enabled: true,
        onLoadMore: jest.fn(),
        hasMore: true,
        loading: false,
        rootMargin: '200px',
      })
    )

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: '200px' }
    )
  })

  it('should use latest callback values via refs', () => {
    const mockLoadMore1 = jest.fn()
    const mockLoadMore2 = jest.fn()
    
    const { rerender } = renderHook(
      ({ onLoadMore }) =>
        useInfiniteScroll({
          enabled: true,
          onLoadMore,
          hasMore: true,
          loading: false,
        }),
      { initialProps: { onLoadMore: mockLoadMore1 } }
    )

    // Change the callback
    rerender({ onLoadMore: mockLoadMore2 })

    // Simulate intersection
    const mockEntry: Partial<IntersectionObserverEntry> = {
      isIntersecting: true,
      target: document.createElement('div'),
      intersectionRatio: 1,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    }

    observerCallback([mockEntry as IntersectionObserverEntry], {} as IntersectionObserver)

    // Should call the NEW callback, not the old one
    expect(mockLoadMore1).not.toHaveBeenCalled()
    expect(mockLoadMore2).toHaveBeenCalledTimes(1)
  })
})
