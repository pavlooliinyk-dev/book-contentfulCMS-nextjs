"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Book = {
  title?: string;
  slug?: string;
  shortDescription?: { json?: any };
  coverImage?: { url?: string };
  numberOfPages?: number;
  authorsCollection?: { items: { name: string }[] };
  externalResourceLink?: string;
  taxonomy?: any;
};

export default function BooksClient({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState<Book[]>(initialBooks || []);
  const [total, setTotal] = useState(initialBooks?.length || 0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isInfinite, setIsInfinite] = useState(true);
  const LIMIT = 5;

  const fetchBooks = (skip: number, append = false) => {
    setLoading(true);
    fetch(`/api/books?limit=${LIMIT}&skip=${skip}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.errors) {
          setError("Error fetching books");
          return;
        }
        setBooks((prev) => (append ? [...prev, ...data.items] : data.items));
        setTotal(data.total);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  // Infinite Scroll Logic
  useEffect(() => {
    if (!isInfinite || loading || books.length >= total) return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 50 >=
        document.documentElement.offsetHeight
      ) {
        setPage((p) => {
          const next = p + 1;
          fetchBooks(next * LIMIT, true);
          return next;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isInfinite, loading, books.length, total]);

  const togglePagination = () => {
    setIsInfinite(!isInfinite);
    setPage(0);
    fetchBooks(0);
  };

  const goToPage = (direction: number) => {
    const next = page + direction;
    setPage(next);
    fetchBooks(next * LIMIT);
  };

  if (error) return <div className="mt-8 text-red-600">{error}</div>;

  return (
    <section className="mt-12 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold">
          <Link href={`/books`}>
            Books
          </Link>
        </h2>
        <button
          onClick={togglePagination}
          className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          {isInfinite ? "Switch to Buttons" : "Switch to Infinite Scroll"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {books.map((b, i) => (
          <article key={i} className="flex flex-col">
            {b.coverImage?.url && (
              <div className="mb-5">
                <Link href={`/books/${b.slug}`}>
                  <img
                    src={b.coverImage.url}
                    alt={b.title}
                    className="w-full h-[400px] object-cover hover:opacity-80 transition shadow-md rounded"
                  />
                </Link>
              </div>
            )}
            <h3 className="text-3xl mb-3 leading-snug font-bold">
              <Link href={`/books/${b.slug}`} className="hover:underline">
                {b.title}
              </Link>
            </h3>
            <div className="text-lg mb-4 text-gray-700">
              {b.authorsCollection?.items && (
                <span className="font-semibold">
                  {b.authorsCollection.items.map((author) => author.name).join(", ")}
                </span>
              )}
              {b.numberOfPages && <span className="ml-4 italic text-gray-500">{b.numberOfPages} pages</span>}
            </div>
            {/* {b.taxonomy && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                  {typeof b.taxonomy === "string" ? b.taxonomy : JSON.stringify(b.taxonomy)}
                </span>
              </div>
            )} */}
          </article>
        ))}
      </div>

      {loading && <div className="mt-8 text-center text-xl animate-pulse">Loading...</div>}

      {!isInfinite && (
        <div className="mt-12 flex justify-center items-center gap-8">
          <button
            onClick={() => goToPage(-1)}
            disabled={page === 0 || loading}
            className="px-6 py-2 border border-black rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition"
          >
            ← Previous
          </button>
          <span className="font-mono text-lg">
            Page {page + 1} of {Math.ceil(total / LIMIT)}
          </span>
          <button
            onClick={() => goToPage(1)}
            disabled={(page + 1) * LIMIT >= total || loading}
            className="px-6 py-2 border border-black rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
