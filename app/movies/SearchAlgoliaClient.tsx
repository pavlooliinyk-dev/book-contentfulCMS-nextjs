"use client";

import dynamic from "next/dynamic";

const SearchAlgolia = dynamic(() => import("./search-algolia"), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
});

export default function SearchAlgoliaClient({ showHits = false }: { showHits?: boolean }) {
  return <SearchAlgolia showHits={showHits} />;
}
