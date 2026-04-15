const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/hooks/**/*.{ts,tsx}',
    'app/_components/book-list/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
  ],
  coverageThreshold: {
    './lib/hooks/': {
      statements: 90,
      branches: 65,
      functions: 85,
      lines: 90,
    },
    './app/_components/book-list/useBooksList.ts': {
      statements: 85,
      branches: 70,
      functions: 85,
      lines: 85,
    },
    './app/_components/book-list/useInfiniteScroll.ts': {
      statements: 85,
      branches: 80,
      functions: 100,
      lines: 85,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/coverage/',
    '__tests__/utils',
    '__tests__/setup.d.ts',
  ],
  testTimeout: 10000,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
