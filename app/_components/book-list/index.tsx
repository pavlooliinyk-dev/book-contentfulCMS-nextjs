"use client";

// import React from "react";
import Link from "next/link";
import { Book, useBooksList } from "./useBooksList";
import Filters from "./filters";
import BookGrid from "./book-grid";

export default function BooksClient({ 
  initialBooks, 
  initialTotal,
  availableTaxonomies = [],
  withFilters = true,
  initialFilters = [],
}: { 
  initialBooks: Book[], 
  initialTotal: number,
  availableTaxonomies?: any[]
  withFilters?: boolean
  initialFilters?: string[]
}) {
  const LIMIT = 5;
  const {
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
  } = useBooksList(initialBooks, initialTotal, LIMIT, initialFilters);

  if (error) return <div className="mt-8 text-red-600">{error}</div>;

  return (
    <section className="mt-12 pb-20">
      <div className="flex flex-col lg:flex-row gap-8">
        {withFilters && availableTaxonomies.length > 0 && (
          <Filters 
            availableTaxonomies={availableTaxonomies}
            selectedTaxIds={selectedTaxIds}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
          />
        )}

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold">
              <Link href={`/books`}>
                Books ({total})
              </Link>
            </h2>
            <button
              onClick={togglePagination}
              className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              {isInfinite ? "Switch to Buttons" : "Switch to Infinite Scroll"}
            </button>
          </div>

          <BookGrid books={books} />
        </div>
      </div>

      {/* Sentinel for infinite scroll */}
      {isInfinite && books.length < total && <div ref={sentinelRef} className="h-10" />}

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
