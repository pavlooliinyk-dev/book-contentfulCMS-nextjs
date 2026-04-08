import Link from "next/link";
import SearchAlgolia from "./search-algolia";

export default async function MoviesPage() {
  return (
    <div className="container mx-auto px-5 pt-10">
      <Link href="/" className="hover:underline">
          go Home
      </Link>
      <h1 className="text-6xl font-bold mb-10">Movies (PLP)</h1>
      <SearchAlgolia showHits={true}/>
    </div>
  );
}
