"use client";

import { memo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Book, TaxonomyTerm } from "@/lib/types";
import { useBooksList } from "./useBooksList";
import Filters from "./filters";
import BookGrid from "./book-grid";
import LoadingSpinner from "../loading-spinner";

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
  const LIMIT = 5;
  
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
  } = useBooksList(initialBooks, initialTotal, LIMIT, initialFilters);

  // Debounce loading state with minimum display time to prevent flashing
  const [showPending, setShowPending] = useState(false);
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (loading) {
      // Clear any pending hide timer
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      
      // Show after 150ms delay (avoid showing for very fast operations)
      showTimerRef.current = setTimeout(() => {
        setShowPending(true);
      }, 150);
    } else {
      // Clear show timer if operation completes before delay
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      
      // If currently showing, keep visible for minimum 300ms to avoid flash
      if (showPending) {
        hideTimerRef.current = setTimeout(() => {
          setShowPending(false);
        }, 300);
      }
    }

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [loading, showPending]);

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
                Books ({total}) {showPending ? " - Updating..." : ""}
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
            Page {page + 1} of {Math.ceil(total / LIMIT)}
          </span>
          <button
            onClick={() => goToPage(1)}
            disabled={(page + 1) * LIMIT >= total || loading || showPending}
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
