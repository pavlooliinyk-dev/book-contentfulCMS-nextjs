"use client";

import { useState, useEffect, useRef } from "react";

export type Book = {
  title?: string;
  slug?: string;
  shortDescription?: { json?: any };
  coverImage?: { url?: string };
  numberOfPages?: number;
  rating?: number | null;
  authorsCollection?: { items: { name: string }[] };
  externalResourceLink?: string;
  metaUI?: object;
};

export function useBooksList(initialBooks: Book[], initialTotal: number, limit: number) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [total, setTotal] = useState(initialTotal);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isInfinite, setIsInfinite] = useState(true);
  const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchBooks = (skip: number, append = false, currentTaxIds = selectedTaxIds) => {
    setLoading(true);
    const taxParam = currentTaxIds.length > 0 ? `&taxonomies=${currentTaxIds.join(",")}` : "";
    fetch(`/api/books?limit=${limit}&skip=${skip}${taxParam}`)
      .then((r) => r.json())
      .then((data) => {
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
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  const handleFilterChange = (tax: any) => {
    const taxValue = tax.title;
    const nextIds = selectedTaxIds.includes(taxValue)
      ? selectedTaxIds.filter(id => id !== taxValue)
      : [...selectedTaxIds, taxValue];
    
    setSelectedTaxIds(nextIds);
    setPage(0);
    fetchBooks(0, false, nextIds);
  };

  const clearFilters = () => {
    setSelectedTaxIds([]);
    setPage(0);
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
            fetchBooks(next * limit, true);
            return next;
          });
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isInfinite, loading, books.length, total]);

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
