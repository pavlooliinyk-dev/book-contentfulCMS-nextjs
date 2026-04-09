"use client";

import React from "react";
import { TaxonomyTerm } from "@/lib/types";

interface FiltersProps {
  availableTaxonomies: TaxonomyTerm[];
  selectedTaxIds: string[];
  handleFilterChange: (tax: TaxonomyTerm) => void;
  clearFilters: () => void;
}

export default function Filters({
  availableTaxonomies,
  selectedTaxIds,
  handleFilterChange,
  clearFilters,
}: FiltersProps) {
  const groupedTax = availableTaxonomies.reduce((acc: Record<string, TaxonomyTerm[]>, tax: TaxonomyTerm) => {
    const type = tax.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(tax);
    return acc;
  }, {} as Record<string, TaxonomyTerm[]>);

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-10 space-y-8">
        <h3 className="text-xl font-bold border-b pb-2">Filters</h3>
        {Object.keys(groupedTax).map((type) => (
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
        {selectedTaxIds.length > 0 && (
          <button 
            onClick={clearFilters}
            className="text-sm text-red-600 hover:underline pt-4"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}
