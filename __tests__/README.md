# Test Suite

Comprehensive test coverage for custom React hooks and components.

## Setup

Install test dependencies:

```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
__tests__/
├── hooks/
│   ├── useInfiniteScroll.test.ts    # IntersectionObserver-based infinite scroll
│   ├── useFetch.test.ts             # Data fetching with abort support
│   ├── useBooksList.test.ts         # Book list state management
│   └── useLazyStyles.test.ts        # Lazy CSS module loading
```

## Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%


## Mocking Strategy

### Next.js Router
```typescript
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
}))
```

### IntersectionObserver
```typescript
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}
```

### Fetch API
```typescript
global.fetch = jest.fn()
```

## Best Practices Followed

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Descriptive Names**: Test names clearly describe what is being tested
3. **AAA Pattern**: Arrange, Act, Assert
4. **Mock Cleanup**: `afterEach()` clears all mocks
5. **Async Handling**: Proper use of `waitFor()` and `act()`
6. **Edge Cases**: Tests cover error scenarios, abort cases, and race conditions
7. **Memory Safety**: Tests verify cleanup on unmount

## Debugging Tests

To debug a specific test:

```bash
# Run a single test file
npm test -- useInfiniteScroll.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should disconnect observer"

# Run with verbose output
npm test -- --verbose
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run tests
  run: npm test -- --coverage --maxWorkers=2

- name: Check coverage thresholds
  run: |
    if [ $(npm test -- --coverage --silent | grep "All files" | awk '{print $10}' | sed 's/%//') -lt 70 ]; then
      echo "Coverage below 70%"
      exit 1
    fi
```

## Writing New Tests

When adding new hooks or components:

1. Create test file in `__tests__/` directory
2. Follow existing patterns for mocking
3. Test both happy path and error scenarios
4. Ensure cleanup is tested (unmount, abort, etc.)
5. Run `npm run test:coverage` to verify coverage

## Common Patterns

### Testing Custom Hooks
```typescript
import { renderHook, waitFor } from '@testing-library/react'

it('should do something', async () => {
  const { result } = renderHook(() => useYourHook())
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined()
  })
})
```

### Testing with Next.js Router
```typescript
const mockPush = jest.fn()
;(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
})

// Later in test
expect(mockPush).toHaveBeenCalledWith(expectedPath)
```

### Testing Abort Controllers
```typescript
const abortSpy = jest.spyOn(AbortController.prototype, 'abort')
const { unmount } = renderHook(() => useYourHook())

unmount()

expect(abortSpy).toHaveBeenCalled()
abortSpy.mockRestore()
```

## Troubleshooting

### "Cannot find module" errors
- Ensure `moduleNameMapper` in `jest.config.js` matches your tsconfig paths

### Timeouts in async tests
- Increase timeout: `jest.setTimeout(10000)`
- Use `waitFor()` with increased timeout option

### React 18+ warnings
- Wrap state updates in `act()`: `await act(async () => { ... })`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
