"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Book } from "@/lib/types";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { useBookFilters } from "./useBookFilters";
import { useBookPagination } from "./useBookPagination";

export function useBooksList(initialBooks: Book[], initialTotal: number, limit: number, initialFilters: string[] = []) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [total, setTotal] = useState(initialTotal);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch books with proper abort handling and deduplication
  const fetchBooks = useCallback(async (skip: number, append = false, taxIds?: string[]) => {
    // Abort any in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setLoading(true);
    setError(null);
    const taxParam = taxIds && taxIds.length > 0 ? `&taxonomies=${taxIds.join(",")}` : "";
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const response = await fetch(`/api/books?limit=${limit}&skip=${skip}${taxParam}`, {
        signal: controller.signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.errors || data.error) {
        setError(data.error || "Error fetching books");
        return;
      }
      
      const newItems = data.items || [];
      setBooks((prev) => {
        const newBooks = append ? [...prev, ...newItems] : newItems;
        const seen = new Set<string>();
        const unique = newBooks.filter((book: Book) => {
          if (seen.has(book.slug)) return false;
          seen.add(book.slug);
          return true;
        });
        return unique;
      });
      setTotal(data.total);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Fetch aborted (expected during rapid filter changes)', { skip, taxIds });
        }
        return;
      }
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      // Only update loading if this controller hasn't been aborted
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [limit]);

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

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
