"use client";

import { useState, useEffect } from "react";

export type Book = {
  title?: string;
  shortDescription?: { json?: any };
  coverImage?: { url?: string };
  numberOfPages?: number;
  authors?: string[];
  externalResourceLink?: string;
  taxonomy?: string[];
};

export function useBooks() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchBooks() {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        if (!mounted) return;

        if (data.errors) {
          setError(data.errors[0]?.message || "Error fetching books");
        } else {
          setBooks(data.items || []);
        }
      } catch (e) {
        if (mounted) setError(String(e));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchBooks();

    return () => {
      mounted = false;
    };
  }, []);

  return { books, isLoading, error };
}
