import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { TaxonomyTerm } from "@/lib/types";

interface UseBookFiltersOptions {
  initialFilters: string[];
  onFilterChange?: (filters: string[]) => void;
}

/**
 * Manages book filter state and URL synchronization
 */
export function useBookFilters({ initialFilters, onFilterChange }: UseBookFiltersOptions) {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  
  const [selectedTaxIds, setSelectedTaxIds] = useState<string[]>(initialFilters);
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

  const handleFilterChange = useCallback((tax: TaxonomyTerm) => {
    const taxValue = tax.title;
    const currentIds = selectedTaxIdsRef.current;
    const nextIds = currentIds.includes(taxValue)
      ? currentIds.filter(id => id !== taxValue)
      : [...currentIds, taxValue];
    
    startTransition(() => {
      setSelectedTaxIds(nextIds);
      updateURL(nextIds);
      onFilterChange?.(nextIds);
    });
  }, [updateURL, onFilterChange]);

  const clearFilters = useCallback(() => {
    const emptyFilters: string[] = [];
    startTransition(() => {
      setSelectedTaxIds(emptyFilters);
      updateURL(emptyFilters);
      onFilterChange?.(emptyFilters);
    });
  }, [updateURL, onFilterChange]);

  // Keep ref in sync with state
  useEffect(() => {
    selectedTaxIdsRef.current = selectedTaxIds;
  }, [selectedTaxIds]);

  return {
    selectedTaxIds,
    selectedTaxIdsRef,
    handleFilterChange,
    clearFilters,
    isPending,
  };
}
