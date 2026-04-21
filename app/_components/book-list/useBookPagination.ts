import { useState, useCallback, useTransition } from "react";

interface UseBookPaginationOptions {
  initialPage?: number;
  limit: number;
  onPageChange?: (page: number, append?: boolean) => void;
}

/**
 * Manages book pagination state (page number and infinite scroll mode)
 */
export function useBookPagination({ 
  initialPage = 0, 
  limit,
  onPageChange 
}: UseBookPaginationOptions) {
  const [isPending, startTransition] = useTransition();
  
  const [page, setPage] = useState(initialPage);
  const [isInfinite, setIsInfinite] = useState(true);

  const goToPage = useCallback((direction: number) => {
    startTransition(() => {
      const nextPage = page + direction;
      setPage(nextPage);
      onPageChange?.(nextPage * limit);
    });
  }, [page, limit, onPageChange]);

  const togglePagination = useCallback(() => {
    setIsInfinite((prev) => !prev);
    setPage(0);
    onPageChange?.(0);
  }, [onPageChange]);

  const handleLoadMore = useCallback(() => {
    setPage((prevPage) => {
      const nextPage = prevPage + 1;
      const skip = nextPage * limit;
      onPageChange?.(skip, true);
      return nextPage;
    });
  }, [limit, onPageChange]);

  const resetPage = useCallback(() => {
    setPage(0);
  }, []);

  return {
    page,
    isInfinite,
    goToPage,
    togglePagination,
    handleLoadMore,
    resetPage,
    isPending,
  };
}
