/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// Extend global namespace for test utilities
declare global {
  namespace NodeJS {
    interface Global {
      fetch: jest.MockedFunction<typeof fetch>
      IntersectionObserver: typeof IntersectionObserver
    }
  }
}

export {}
