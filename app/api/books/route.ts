import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { fetchGraphQL } from "@/lib/api";

const BOOK_GRAPHQL_FIELDS = `
  title
  shortDescription {
    json
  }
  coverImage {
    url
  }
  numberOfPages
  externalResourceLink
  authorsCollection {
    items {
      name
    }
  }
`;

export async function GET(request: NextRequest) {
  const { isEnabled } = await draftMode();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "5");
  const skip = parseInt(searchParams.get("skip") || "0");
  const taxonomies = searchParams.get("taxonomies")?.split(",") || [];

  const whereClause = taxonomies.length > 0 && taxonomies[0] !== ""
    ? `, where: { genre_contains_all: ${JSON.stringify(taxonomies)} }`
    : "";

  try {
    const result = await fetchGraphQL(
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

    const bookCollection = result?.data?.bookCollection || { items: [], total: 0 };
    
    // Generate virtual slugs from titles
    bookCollection.items = bookCollection.items.map((book: any) => ({
      ...book,
      slug: book.title
        ? book.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
        : "",
    }));

    return NextResponse.json(bookCollection);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
