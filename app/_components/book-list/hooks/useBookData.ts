"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Book } from "@/lib/types";

export function useBookData(initialBooks: Book[], initialTotal: number, limit: number) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchBooks = useCallback(async (skip: number, append = false, taxIds?: string[]) => {
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
        return newBooks.filter((book: Book) => {
          if (seen.has(book.slug)) return false;
          seen.add(book.slug);
          return true;
        });
      });
      setTotal(data.total);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        if (process.env.NODE_ENV === "development") {
          console.debug("Fetch aborted (expected during rapid filter changes)", { skip, taxIds });
        }
        return;
      }
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [limit]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { books, total, loading, error, fetchBooks };
}
