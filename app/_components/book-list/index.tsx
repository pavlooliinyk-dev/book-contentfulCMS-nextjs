"use client";

import { memo } from "react";
import Link from "next/link";
import { Book, TaxonomyTerm } from "@/lib/types";
import { useBooksList } from "./useBooksList";
import { useDebouncedPending } from "./useDebouncedPending";
import Filters from "./filters";
import BookGrid from "./book-grid";
import LoadingSpinner from "../loading-spinner";
import { BOOKS_DEFAULT_LIMIT } from "@/lib/constants";

interface BooksListProps {
  initialBooks: Book[], 
  initialTotal: number,
  availableTaxonomies?: TaxonomyTerm[]
  withFilters?: boolean
  initialFilters?: string[]
}

const EMPTY_FILTERS: string[] = [];
const EMPTY_TAXONOMIES: TaxonomyTerm[] = [];

const BooksList = memo(function BooksList({ 
  initialBooks, 
  initialTotal,
  availableTaxonomies = EMPTY_TAXONOMIES,
  initialFilters = EMPTY_FILTERS,
  withFilters = true,
}: BooksListProps) {  
  const {
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
  } = useBooksList(initialBooks, initialTotal, BOOKS_DEFAULT_LIMIT, initialFilters);

  // Debounce loading state to prevent flashing on fast operations
  const showPending = useDebouncedPending(loading);

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
                Books ({books.length} of {total}) {showPending ? " - Updating..." : ""}
              </Link>
            </h2>
            <button
              onClick={togglePagination}
              className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              {isInfinite ? "Switch to Buttons" : "Switch to Infinite Scroll"}
            </button>
          </div>

          <div className={`transition-opacity duration-200 ${showPending ? 'opacity-50' : 'opacity-100'}`}>
            <BookGrid books={books} />
          </div>
        </div>
      </div>

      {/* Sentinel for infinite scroll */}
      {isInfinite && books.length < total && (
        <div 
          ref={sentinelRef} 
          className="h-10" 
          role="status" 
          aria-label="Loading more books"
          aria-live="polite"
          aria-busy={loading}
        />
      )}

      {(loading || showPending) && (
        <LoadingSpinner message="Loading more books..." />
      )}

      {!isInfinite && (
        <div className="mt-12 flex justify-center items-center gap-8">
          <button
            onClick={() => goToPage(-1)}
            disabled={page === 0 || loading || showPending}
            className="px-6 py-2 border border-black rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition"
          >
            ← Previous
          </button>
          <span className="font-mono text-lg">
            Page {page + 1} of {Math.ceil(total / BOOKS_DEFAULT_LIMIT)}
          </span>
          <button
            onClick={() => goToPage(1)}
            disabled={(page + 1) * BOOKS_DEFAULT_LIMIT >= total || loading || showPending}
            className="px-6 py-2 border border-black rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
});

BooksList.displayName = 'BooksList';

export default BooksList;
