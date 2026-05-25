"use client";

import { memo } from "react";
import { Book, TaxonomyTerm } from "@/lib/types";
import { BOOKS_DEFAULT_LIMIT } from "@/lib/constants";
import { useBooksList } from "./hooks/useBooksList";
import { useDebouncedPending } from "./hooks/useDebouncedPending";
import Filters from "./filters";
import BookGrid from "./book-grid";
import BookListHeader from "../book-list-header";
import ButtonPagination from "../button-pagination";
import InfiniteScrollSentinel from "../infinite-scroll-sentinel";
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
  } = useBooksList(initialBooks, initialTotal, BOOKS_DEFAULT_LIMIT, initialFilters);

  // Debounce loading state to prevent flashing on fast operations
  const showPending = useDebouncedPending(loading);

  if (error) throw new Error(error);

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
          <BookListHeader
            bookCount={books.length}
            total={total}
            isInfinite={isInfinite}
            showPending={showPending}
            onTogglePagination={togglePagination}
          />

          <div className={`transition-opacity duration-200 ${showPending ? 'opacity-50' : 'opacity-100'}`}>
            <BookGrid books={books} />
          </div>
        </div>
      </div>

      {isInfinite && books.length < total && (
        <InfiniteScrollSentinel sentinelRef={sentinelRef} loading={loading} />
      )}

      {showPending && (
        <LoadingSpinner message="Loading more books..." />
      )}

      {!isInfinite && (
        <ButtonPagination
          page={page}
          total={total}
          limit={BOOKS_DEFAULT_LIMIT}
          disabled={showPending}
          onGoToPage={goToPage}
        />
      )}
    </section>
  );
});

BooksList.displayName = 'BooksList';

export default BooksList;
