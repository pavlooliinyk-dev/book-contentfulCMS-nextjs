/**
 * Test utilities and helpers for unit and integration tests
 */

import { Book, TaxonomyTerm } from '@/lib/types'

/**
 * Create a mock Book object
 */
export function createMockBook(overrides: Partial<Book> = {}): Book {
  return {
    title: 'Test Book',
    slug: 'test-book',
    authors: ['Test Author'],
    taxonomies: [],
    sys: { id: '1' },
    numberOfPages: 300,
    coverImage: { url: 'https://example.com/cover.jpg' },
    ...overrides,
  }
}

/**
 * Create a mock TaxonomyTerm object
 */
export function createMockTaxonomy(overrides: Partial<TaxonomyTerm> = {}): TaxonomyTerm {
  return {
    sys: { id: 'tax-1' },
    title: 'Fiction',
    slug: 'fiction',
    type: 'genre',
    ...overrides,
  }
}

/**
 * Create multiple mock books
 */
export function createMockBooks(count: number): Book[] {
  return Array.from({ length: count }, (_, i) =>
    createMockBook({
      title: `Book ${i + 1}`,
      slug: `book-${i + 1}`,
      sys: { id: String(i + 1) },
    })
  )
}

/**
 * Mock fetch response helper
 */
export function mockFetchResponse<T>(data: T, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => data,
  } as Response)
}

/**
 * Mock fetch error helper
 */
export function mockFetchError(message: string, status = 500) {
  return Promise.reject(new Error(message))
}

/**
 * Wait for a specific amount of time (for testing async behavior)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock IntersectionObserver entry
 */
export function createMockIntersectionObserverEntry(
  isIntersecting: boolean
): Partial<IntersectionObserverEntry> {
  return {
    isIntersecting,
    target: document.createElement('div'),
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    time: Date.now(),
  }
}

/**
 * Create a mock AbortController
 */
export function createMockAbortController() {
  const signal = {
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }
  
  return {
    signal,
    abort: jest.fn(() => {
      signal.aborted = true
    }),
  }
}

/**
 * Suppress console errors/warnings during tests
 */
export function suppressConsole() {
  const originalError = console.error
  const originalWarn = console.warn
  
  beforeEach(() => {
    console.error = jest.fn()
    console.warn = jest.fn()
  })
  
  afterEach(() => {
    console.error = originalError
    console.warn = originalWarn
  })
}

/**
 * Mock Next.js router for tests
 */
export function mockNextRouter(overrides = {}) {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    ...overrides,
  }
}

/**
 * Mock Next.js searchParams
 */
export function mockSearchParams(params: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string) => params[key] || null),
    getAll: jest.fn((key: string) => [params[key]].filter(Boolean)),
    has: jest.fn((key: string) => key in params),
    toString: jest.fn(() => new URLSearchParams(params).toString()),
    entries: jest.fn(() => Object.entries(params)),
    keys: jest.fn(() => Object.keys(params)),
    values: jest.fn(() => Object.values(params)),
  }
}

/**
 * Utility to test if a component properly cleans up resources
 */
export async function testCleanup(
  renderFn: () => { unmount: () => void },
  assertions: () => void
) {
  const { unmount } = renderFn()
  unmount()
  await wait(0) // Let cleanup run
  assertions()
}
