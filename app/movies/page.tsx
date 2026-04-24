import Link from "next/link";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/app/_components/error-boundary";

const SearchAlgolia = dynamic(() => import("./search-algolia"), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
});

export default async function MoviesPage() {
  return (
    <div className="container mx-auto px-5 pt-10">
      <Link href="/" className="hover:underline">
          go Home
      </Link>
      <h1 className="text-6xl font-bold mb-10">Movies (PLP)</h1>
      <ErrorBoundary>
        <SearchAlgolia showHits={true}/>
      </ErrorBoundary>
    </div>
  );
}
