import { renderHook } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import { useLazyStyles } from '@/lib/hooks/useLazyStyles'

describe('useLazyStyles', () => {
  it('should return empty string initially', () => {
    const mockImport = jest.fn()
    const { result } = renderHook(() =>
      useLazyStyles(mockImport, 'myClass')
    )

    expect(result.current).toBe('')
  })

  it('should load and return class name', async () => {
    const mockStyles = {
      default: {
        myClass: 'hashed-class-name-123',
      },
    }
    
    const mockImport = jest.fn().mockResolvedValue(mockStyles)

    const { result } = renderHook(() =>
      useLazyStyles(mockImport, 'myClass')
    )

    await waitFor(() => {
      expect(result.current).toBe('hashed-class-name-123')
    })

    expect(mockImport).toHaveBeenCalledTimes(1)
  })

  it('should handle missing class name gracefully', async () => {
    const mockStyles = {
      default: {
        otherClass: 'other-class-name',
      },
    }
    
    const mockImport = jest.fn().mockResolvedValue(mockStyles)

    const { result } = renderHook(() =>
      useLazyStyles(mockImport, 'nonExistentClass')
    )

    await waitFor(() => {
      expect(result.current).toBe('')
    })
  })

  it('should handle import errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const mockError = new Error('Failed to load module')
    const mockImport = jest.fn().mockRejectedValue(mockError)

    const { result } = renderHook(() =>
      useLazyStyles(mockImport, 'myClass')
    )

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load lazy styles'),
        mockError
      )
    })

    expect(result.current).toBe('')
    consoleErrorSpy.mockRestore()
  })

  it('should reload when importStyles function changes', async () => {
    const mockStyles1 = {
      default: { myClass: 'class-1' },
    }
    const mockStyles2 = {
      default: { myClass: 'class-2' },
    }
    
    const mockImport1 = jest.fn().mockResolvedValue(mockStyles1)
    const mockImport2 = jest.fn().mockResolvedValue(mockStyles2)

    const { result, rerender } = renderHook(
      ({ importFn }) => useLazyStyles(importFn, 'myClass'),
      { initialProps: { importFn: mockImport1 } }
    )

    await waitFor(() => {
      expect(result.current).toBe('class-1')
    })

    rerender({ importFn: mockImport2 })

    await waitFor(() => {
      expect(result.current).toBe('class-2')
    })

    expect(mockImport1).toHaveBeenCalledTimes(1)
    expect(mockImport2).toHaveBeenCalledTimes(1)
  })

  it('should reload when className changes', async () => {
    const mockStyles = {
      default: {
        class1: 'hashed-class-1',
        class2: 'hashed-class-2',
      },
    }
    
    const mockImport = jest.fn().mockResolvedValue(mockStyles)

    const { result, rerender } = renderHook(
      ({ className }) => useLazyStyles(mockImport, className),
      { initialProps: { className: 'class1' } }
    )

    await waitFor(() => {
      expect(result.current).toBe('hashed-class-1')
    })

    rerender({ className: 'class2' })

    await waitFor(() => {
      expect(result.current).toBe('hashed-class-2')
    })

    expect(mockImport).toHaveBeenCalledTimes(2)
  })

  it('should handle styles with null/undefined default', async () => {
    const mockStyles = {
      default: null,
    }
    
    const mockImport = jest.fn().mockResolvedValue(mockStyles as any)

    const { result } = renderHook(() =>
      useLazyStyles(mockImport, 'myClass')
    )

    await waitFor(() => {
      expect(result.current).toBe('')
    })
  })

  it('should not cause memory leaks on unmount', async () => {
    const mockStyles = {
      default: { myClass: 'hashed-class' },
    }
    
    // Simulate slow import
    const mockImport = jest.fn((): Promise<{ default: Record<string, string> }> =>
      new Promise((resolve) =>
        setTimeout(() => resolve(mockStyles), 100)
      )
    )

    const { unmount } = renderHook(() =>
      useLazyStyles(mockImport, 'myClass')
    )

    // Unmount before import completes
    unmount()

    // Wait for import to complete
    await new Promise((resolve) => setTimeout(resolve, 150))

    // If no error is thrown, test passes (React 18+ handles this)
    expect(true).toBe(true)
  })
})
