"use client";

import React, { useMemo, memo } from "react";
import { TaxonomyTerm } from "@/lib/types";

interface FiltersProps {
  availableTaxonomies: TaxonomyTerm[];
  selectedTaxIds: string[];
  handleFilterChange: (tax: TaxonomyTerm) => void;
  clearFilters: () => void;
}

const Filters = memo(function Filters({
  availableTaxonomies,
  selectedTaxIds,
  handleFilterChange,
  clearFilters,
}: FiltersProps) {
  const groupedTax = useMemo(() => 
    availableTaxonomies.reduce((acc: Record<string, TaxonomyTerm[]>, tax: TaxonomyTerm) => {
      const type = tax.type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(tax);
      return acc;
    }, {} as Record<string, TaxonomyTerm[]>),
  [availableTaxonomies]
  );

  const sortedTypes = useMemo(() => 
    Object.keys(groupedTax).sort(),
  [groupedTax]
  );

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="space-y-8 lg:sticky lg:top-10">
        <h3 className="text-xl font-bold border-b pb-2">Filters</h3>
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-6 lg:gap-8">
          {sortedTypes.map((type) => (
            <div key={type} className="space-y-3">
              <h4 className="capitalize font-semibold text-gray-500 text-sm tracking-wider">
                {type}
              </h4>
              <div className="flex flex-col gap-2">
                {groupedTax[type].map((tax: TaxonomyTerm) => (
                  <label key={tax.sys.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedTaxIds.includes(tax.title)}
                      onChange={() => handleFilterChange(tax)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm group-hover:text-black transition-colors">
                      {tax.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {selectedTaxIds.length > 0 && (
          <button 
            onClick={clearFilters}
            className="text-sm text-red-600 hover:underline pt-4"
            aria-label={`Clear ${selectedTaxIds.length} active filters`}
          >
            Clear all filters ({selectedTaxIds.length})
          </button>
        )}
      </div>
    </aside>
  );
});

Filters.displayName = 'Filters';

export default Filters;
