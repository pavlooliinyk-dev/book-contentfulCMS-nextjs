"use client";

import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
  useSearchBox,
  Pagination,
} from "react-instantsearch";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import Image from "next/image";

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME!;

const searchClient = algoliasearch(appId, searchKey);

type HitProps = {
  hit: {
    objectID: string;
    title?: string;
    overview?: string;
    original_language?: string;
    poster_path?: string;
    url?: string;
    release_date?: string;
  };
};

function Hit({ hit }: HitProps) {
  const content = (
    <article className="flex gap-4 rounded border p-3">
      {hit.poster_path ? (
        <Image
          src={hit.poster_path}
          alt={hit.title ?? "Untitled"}
          className="h-24 w-16 rounded object-cover"
          width={64}
          height={96}
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <h2 className="font-semibold">{hit.title ?? "Untitled"}</h2>
        {hit.overview ? (
          <p className="mt-1 line-clamp-3 text-sm text-gray-600">
            {hit.overview}
          </p>
        ) : null}
        {hit.release_date ? (
          <p className="mt-2 text-xs text-gray-500">
            {hit.release_date}
          </p>
        ) : null}
        {hit.original_language ? (
          <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">
            {hit.original_language}
          </p>
        ) : null}
      </div>
    </article>
  );

  if (hit.url) {
    return (
      <a href={hit.url} className="block hover:opacity-90">
        {content}
      </a>
    );
  }

  return (
    content
  );
}

function SearchResults({ showWhenEmpty = false }: { showWhenEmpty?: boolean }) {
  const { query } = useSearchBox();

  if (!showWhenEmpty && !query.trim()) {
    return null;
  }

  return (
    <Hits
      hitComponent={Hit}
      classNames={{
        list: "grid gap-4",
      }}
    />
  );
}

export default function SearchAlgolia({showHits = false}: {showHits?: boolean}) {
  if (!appId || !searchKey || !indexName) {
    return <div className="text-red-600">Algolia env vars are missing.</div>;
  }

  return (
    <div className="mb-8">
      <InstantSearch indexName={indexName} searchClient={searchClient}
        initialUiState={{
          [indexName]: {
            // Sets the initial query for the SearchBox widget
            query: "dune",
            // Sets the initial page number for the Pagination widget
            page: 1,
          },
        }}>
        <Configure hitsPerPage={20} />
        <SearchBox
          placeholder="Search movies in algolia..."
          classNames={{
            root: "mb-4",
            form: "relative flex items-center",
            input: "w-full rounded border border-gray-300 py-2 pl-10 pr-10 outline-none transition focus:border-gray-500",
            submit: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500",
            submitIcon: "h-4 w-4",
            reset: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400",
            resetIcon: "h-3 w-3",
            loadingIndicator: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400",
            loadingIcon: "h-4 w-4",
          }}
        />
        <SearchResults showWhenEmpty={showHits} />
        <Pagination
          classNames={{
            root: "mt-6",
            list: "flex flex-wrap items-center gap-2",
            item: "list-none",
            link: "inline-flex h-9 min-w-9 items-center justify-center rounded border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50",
            selectedItem: "!border-gray-200 !bg-gray-200 !text-white",
            disabledItem: "opacity-40 pointer-events-none",
            previousPageItem: "mr-1",
            nextPageItem: "ml-1",
            firstPageItem: "mr-1",
            lastPageItem: "ml-1",
          }}
        />
      </InstantSearch>
    </div>
  );
}
