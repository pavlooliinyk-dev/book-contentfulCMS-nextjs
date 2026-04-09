"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Book, TaxonomyTerm } from "@/lib/types";

export function useBooksList(initialBooks: Book[], initialTotal: number, limit: number, initialFilters: string[] = []) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [total, setTotal] = useState(initialTotal);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isInfinite, setIsInfinite] = useState(true);
  const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>(initialFilters);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // Update URL when filters change
  const updateURL = (filters: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.length > 0) {
      params.set('taxonomies', filters.join(','));
    } else {
      params.delete('taxonomies');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const fetchBooks = useCallback(async (skip: number, append = false, currentTaxIds = selectedTaxIds) => {
    setLoading(true);
    setError(null);
    const taxParam = currentTaxIds.length > 0 ? `&taxonomies=${currentTaxIds.join(",")}` : "";
    
    const controller = new AbortController();
    
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
        const unique = newBooks.filter((book: Book, index: number, self: Book[]) =>
          index === self.findIndex((b: Book) => b.title === book.title)
        );
        return unique;
      });
      setTotal(data.total);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return; // Silently ignore abort errors
      }
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [limit, selectedTaxIds]);

  const handleFilterChange = (tax: TaxonomyTerm) => {
    const taxValue = tax.title;
    const nextIds = selectedTaxIds.includes(taxValue)
      ? selectedTaxIds.filter(id => id !== taxValue)
      : [...selectedTaxIds, taxValue];
    
    setSelectedTaxIds(nextIds);
    setPage(0);
    updateURL(nextIds);
    fetchBooks(0, false, nextIds);
  };

  const clearFilters = () => {
    setSelectedTaxIds([]);
    setPage(0);
    updateURL([]);
    fetchBooks(0, false, []);
  };

  const togglePagination = () => {
    setIsInfinite(!isInfinite);
    setPage(0);
    fetchBooks(0);
  };

  const goToPage = (direction: number) => {
    const next = page + direction;
    setPage(next);
    fetchBooks(next * limit);
  };

  useEffect(() => {
    if (!isInfinite || !sentinelRef.current || books.length >= total) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((p) => {
            const next = p + 1;
            // console.log('useBooksList IntersectionObserver -> fetchBooks', next * limit);

            fetchBooks(next * limit, true);
            return next;
          });
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isInfinite, loading, books.length, total, fetchBooks, limit]);

  return {
    books,
    total,
    error,
    loading,
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
