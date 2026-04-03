import { draftMode } from "next/headers";
import BooksClient from "../_components/book-list";
import { getAllBooks, getTaxonomies } from "@/lib/api";
import Link from "next/link";
import SearchAlgolia from "../_components/search-algolia";

export default async function BooksPage() {
  const { isEnabled } = await draftMode();
  const [{ items, total }, taxonomies] = await Promise.all([
    getAllBooks(isEnabled, 10),
    getTaxonomies(isEnabled),
  ]);
  
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
