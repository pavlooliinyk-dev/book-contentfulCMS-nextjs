import { draftMode } from "next/headers";
import BooksList from "@/app/_components/book-list";
import { getAllBooks, getTaxonomies } from "@/lib/api";
import Link from "next/link";
import { ErrorBoundary } from "@/app/_components/error-boundary";
import { BOOKS_DEFAULT_LIMIT } from "@/lib/constants";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { isEnabled } = await draftMode();
  const params = await searchParams;
  
  // Extract taxonomies from URL query params
  const taxonomiesParam = params.taxonomies;
  const initialFilters = taxonomiesParam 
    ? (Array.isArray(taxonomiesParam) ? taxonomiesParam : taxonomiesParam.split(','))
    : [];
  
  const [{ items, total }, taxonomies] = await Promise.all([
    getAllBooks(isEnabled, BOOKS_DEFAULT_LIMIT, 0, initialFilters), // Fetch first page of books with filters
    getTaxonomies(isEnabled),
  ]);
  
  return (
    <div className="container mx-auto px-5 pt-10">
      <Link href="/" className="hover:underline">
        {'go Home'}
      </Link>
      <h1 className="text-6xl font-bold mb-10">Library (PLP)</h1>
      
      <ErrorBoundary>
        <BooksList 
          initialBooks={items} 
          initialTotal={total} 
          availableTaxonomies={taxonomies}
          initialFilters={initialFilters}
          priorityFirstImage
        />
      </ErrorBoundary>
    </div>
  );
}
