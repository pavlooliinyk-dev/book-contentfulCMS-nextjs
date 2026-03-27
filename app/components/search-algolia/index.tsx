"use client";

import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
  useSearchBox,
} from "react-instantsearch";
import { liteClient as algoliasearch } from "algoliasearch/lite";

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
  };
};

function Hit({ hit }: HitProps) {
  const content = (
    <article className="flex gap-4 rounded border p-3">
      {hit.poster_path ? (
        <img
          src={hit.poster_path}
          alt={hit.title ?? "Untitled"}
          className="h-24 w-16 rounded object-cover"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <h2 className="font-semibold">{hit.title ?? "Untitled"}</h2>
        {hit.overview ? (
          <p className="mt-1 line-clamp-3 text-sm text-gray-600">
            {hit.overview}
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

function SearchResults() {
  const { query } = useSearchBox();

  if (!query.trim()) {
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

export default function SearchAlgolia() {
  if (!appId || !searchKey || !indexName) {
    return <div className="text-red-600">Algolia env vars are missing.</div>;
  }

  return (
    <div className="mb-8">
      <InstantSearch indexName={indexName} searchClient={searchClient}>
        <Configure hitsPerPage={5} />
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
        <SearchResults />
      </InstantSearch>
    </div>
  );
}

/*

applicationId="6NHK71ROMP"
  apiKey="4fd4226dcfb0044e816cd99661284bf8"
  indexName="algolia_movie_sample_dataset"
  attributes={{
    primaryText: "title", // the attribute to display in the hits list
    secondaryText: "overview", // the secondary attribute to display in the hits list
    tertiaryText: "original_language", // the tertiary attribute to display in the hits list
    url: "", // the URL of the hit
    image: "poster_path" // the image URL of the hit
  }}
  darkMode={false}

<InstantSearch
indexName={string}
        searchClient={object}
        // Optional props
        initialUiState={object}
        onStateChange={function}
        stalledSearchDelay={number}
        routing={boolean | object}
        insights={boolean | object}
        future={{
          preserveSharedStateOnUnmount: boolean,
          persistHierarchicalRootCount: boolean,
        }}

        npx shadcn@latest add @algolia/search
        import Search from "@/components/search";

<Search
  applicationId="6NHK71ROMP"
  apiKey="4fd4226dcfb0044e816cd99661284bf8"
  indexName="algolia_movie_sample_dataset"
  attributes={{
    primaryText: "title", // the attribute to display in the hits list
    secondaryText: "overview", // the secondary attribute to display in the hits list
    tertiaryText: "original_language", // the tertiary attribute to display in the hits list
    url: "", // the URL of the hit
    image: "poster_path" // the image URL of the hit
  }}
  darkMode={false}
/>
      
*/