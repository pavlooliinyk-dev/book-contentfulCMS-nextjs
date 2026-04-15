// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    toString: jest.fn(() => ''),
  })),
  usePathname: jest.fn(() => '/'),
}))

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  callback: IntersectionObserverCallback
  options?: IntersectionObserverInit

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
  }
  
  observe(): void {
    return
  }
  
  disconnect(): void {
    return
  }
  
  unobserve(): void {
    return
  }
  
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  
  get root(): Element | Document | null {
    return null
  }
  
  get rootMargin(): string {
    return this.options?.rootMargin || '0px'
  }
  
  get thresholds(): ReadonlyArray<number> {
    return [0]
  }
} as any

// Mock window.fetch if needed
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>
