import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { fetchGraphQL } from "@/lib/api";
import { BOOK_GRAPHQL_FIELDS } from "@/lib/graphql/fragments";
import { BookCollectionData, BookRaw, Book } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { isEnabled } = await draftMode();
  const { searchParams } = new URL(request.url);
  
  const MAX_LIMIT = 100;
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") || "5")),
    MAX_LIMIT
  );
  const skip = Math.max(0, parseInt(searchParams.get("skip") || "0"));
  
  // Validate parsed numbers
  if (isNaN(limit) || isNaN(skip)) {
    return NextResponse.json(
      { error: "Invalid limit or skip parameter" },
      { status: 400 }
    );
  }
  
  const taxonomies = searchParams.get("taxonomies")?.split(",") || [];

  const whereClause = taxonomies.length > 0 && taxonomies[0] !== ""
    ? `, where: { genre_contains_all: ${JSON.stringify(taxonomies)} }`
    : "";

  try {
    const result = await fetchGraphQL<BookCollectionData>(
      `query {
        bookCollection(limit: ${limit}, skip: ${skip}, order: title_DESC, preview: ${isEnabled ? "true" : "false"}${whereClause}) {
          total
          items {
            ${BOOK_GRAPHQL_FIELDS}
          }
        }
      }`,
      isEnabled
    );

    if (result.errors) {
      return NextResponse.json({ errors: result.errors }, { status: 500 });
    }

    const items = result?.data?.bookCollection?.items || [];
    const total = result?.data?.bookCollection?.total || 0;
    
    // Transform to Book type with authors and taxonomies arrays
    const formattedItems: Book[] = items.map((book: BookRaw) => ({
      ...book,
      authors: book.authorsCollection?.items?.map((item) => item.name) || [],
      taxonomies: book.taxonomiesCollection?.items || [],
    }));

    return NextResponse.json({ items: formattedItems, total });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
