import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";

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

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = isEnabled
    ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
    : process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!spaceId || !token) {
    return NextResponse.json({ error: "Missing Contentful configuration" }, { status: 500 });
  }

  const whereClause = taxonomies.length > 0 && taxonomies[0] !== ""
    ? `, where: { genre_contains_all: ${JSON.stringify(taxonomies)} }`
    : "";

  const queryBody = {
    query: `
      query GetBooks($limit: Int, $skip: Int, $preview: Boolean) {
        bookCollection(limit: $limit, skip: $skip, order: title_DESC, preview: $preview ${whereClause}) {
          total
          items {
            ${BOOK_GRAPHQL_FIELDS}
          }
        }
      }
    `,
    variables: {
      limit,
      skip,
      preview: isEnabled
    }
  };

  try {
    const res = await fetch(`https://graphql.contentful.com/content/v1/spaces/${spaceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(queryBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Contentful API Error:", errorText);
      return NextResponse.json({ error: `Contentful API error: ${res.status}`, detail: errorText }, { status: res.status });
    }

    const json = await res.json();

    if (json.errors) {
      return NextResponse.json({ errors: json.errors }, { status: 500 });
    }

    const bookCollection = json?.data?.bookCollection || { items: [], total: 0 };
    
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
