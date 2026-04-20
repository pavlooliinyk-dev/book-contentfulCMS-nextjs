"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Book, TaxonomyTerm } from "@/lib/types";
import { useInfiniteScroll } from "./useInfiniteScroll";

export function useBooksList(initialBooks: Book[], initialTotal: number, limit: number, initialFilters: string[] = []) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [total, setTotal] = useState(initialTotal);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isInfinite, setIsInfinite] = useState(true);
  const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>(initialFilters);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  // Use ref to avoid stale closures in fetchBooks callback
  const selectedTaxIdsRef = useRef<string[]>(initialFilters);
  
  // Update URL when filters change without triggering re-render
  const updateURL = useCallback((filters: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentTaxonomies = params.get('taxonomies');
    const newTaxonomies = filters.length > 0 ? filters.join(',') : null;
    
    // Only update if URL actually changes
    if (currentTaxonomies !== newTaxonomies) {
      if (newTaxonomies) {
        params.set('taxonomies', newTaxonomies);
      } else {
        params.delete('taxonomies');
      }
      // Use replaceState to update URL without navigation/re-render
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchParams]);

  // Fetch books with proper abort handling and deduplication
  // Uses ref for taxIds to avoid stale closures while keeping stable callback
  const fetchBooks = useCallback(async (skip: number, append = false, currentTaxIds?: string[]) => {
    // Use ref value if currentTaxIds not provided, avoiding stale closure
    const taxIds = currentTaxIds ?? selectedTaxIdsRef.current;
    
    // Abort any in-flight request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setLoading(true);
    setError(null);
    const taxParam = taxIds.length > 0 ? `&taxonomies=${taxIds.join(",")}` : "";
    
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

  const handleFilterChange = useCallback((tax: TaxonomyTerm) => {
    const taxValue = tax.title;
    const currentIds = selectedTaxIdsRef.current;
    const nextIds = currentIds.includes(taxValue)
      ? currentIds.filter(id => id !== taxValue)
      : [...currentIds, taxValue];
    
    startTransition(() => {
      setSelectedTaxIds(nextIds);
      setPage(0);
      updateURL(nextIds);
      fetchBooks(0, false, nextIds);
    });
  }, [updateURL, fetchBooks]);

  const clearFilters = useCallback(() => {
    const emptyFilters: string[] = [];
    startTransition(() => {
      setSelectedTaxIds(emptyFilters);
      setPage(0);
      updateURL(emptyFilters);
      fetchBooks(0, false, emptyFilters);
    });
  }, [updateURL, fetchBooks]);

  const togglePagination = useCallback(() => {
    setIsInfinite((prev) => !prev);
    setPage(0);
    fetchBooks(0);
  }, [fetchBooks]);

  const goToPage = useCallback((direction: number) => {
    startTransition(() => {
      const next = page + direction;
      setPage(next);
      fetchBooks(next * limit);
    });
  }, [page, fetchBooks, limit]);

  // Callback for infinite scroll - optimized to avoid recreating observer
  const handleLoadMore = useCallback(() => {
    setPage((prevPage) => {
      const nextPage = prevPage + 1;
      const skip = nextPage * limit;
      fetchBooks(skip, true);
      return nextPage;
    });
  }, [fetchBooks, limit]);

  // Use infinite scroll hook with ref callback pattern
  const sentinelRef = useInfiniteScroll({
    enabled: isInfinite,
    onLoadMore: handleLoadMore,
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

  // Keep ref in sync with state
  useEffect(() => {
    selectedTaxIdsRef.current = selectedTaxIds;
  }, [selectedTaxIds]);

  return {
    books,
    total,
    error,
    loading,
    isPending,
    page,
    isInfinite,
    selectedTaxIds,
    sentinelRef,
    handleFilterChange,
    clearFilters,
    togglePagination,
    goToPage,
  };
}
