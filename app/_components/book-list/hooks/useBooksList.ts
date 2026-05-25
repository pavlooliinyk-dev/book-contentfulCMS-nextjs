"use client";

import { Book } from "@/lib/types";
import { useBookData } from "./useBookData";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { useBookFilters } from "./useBookFilters";
import { useBookPagination } from "./useBookPagination";

export function useBooksList(initialBooks: Book[], initialTotal: number, limit: number, initialFilters: string[] = []) {
  const { books, total, loading, error, fetchBooks } = useBookData(initialBooks, initialTotal, limit);

  // Initialize filters hook
  const {
    selectedTaxIds,
    selectedTaxIdsRef,
    handleFilterChange: handleFilterChangeBase,
    clearFilters: clearFiltersBase,
    isPending: filtersPending,
  } = useBookFilters({
    initialFilters,
    onFilterChange: (filters) => {
      pagination.resetPage();
      fetchBooks(0, false, filters);
    },
  });

  // Initialize pagination hook
  const pagination = useBookPagination({
    limit,
    onPageChange: (skip, append) => {
      fetchBooks(skip, append, selectedTaxIdsRef.current);
    },
  });

  // Use infinite scroll hook with ref callback pattern
  const sentinelRef = useInfiniteScroll({
    enabled: pagination.isInfinite,
    onLoadMore: pagination.handleLoadMore,
    hasMore: books.length < total,
    loading,
    rootMargin: "100px",
  });

  return {
    books,
    total,
    error,
    loading: loading || filtersPending || pagination.isPending,
    page: pagination.page,
    isInfinite: pagination.isInfinite,
    selectedTaxIds,
    sentinelRef,
    handleFilterChange: handleFilterChangeBase,
    clearFilters: clearFiltersBase,
    togglePagination: pagination.togglePagination,
    goToPage: pagination.goToPage,
  };
}
