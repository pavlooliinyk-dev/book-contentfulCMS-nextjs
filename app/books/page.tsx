import { draftMode } from "next/headers";
import BooksClient from "../components/book-list";
import { getAllBooks, getTaxonomies } from "@/lib/api";

export default async function BooksPage() {
  const { isEnabled } = await draftMode();
  const [{ items, total }, taxonomies] = await Promise.all([
    getAllBooks(isEnabled, 10),
    getTaxonomies(isEnabled),
  ]);
  
  return (
    <div className="container mx-auto px-5 pt-10">
      <h1 className="text-6xl font-bold mb-10">Library (PLP)</h1>
      <BooksClient 
        initialBooks={items} 
        initialTotal={total} 
        availableTaxonomies={taxonomies}
      />
    </div>
  );
}
