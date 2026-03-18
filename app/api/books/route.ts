import { NextRequest, NextResponse } from "next/server";

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
  taxonomy
  authorsCollection {
    items {
      name
    }
  }
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "5");
  const skip = parseInt(searchParams.get("skip") || "0");

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!spaceId || !token) {
    return NextResponse.json({ error: "Missing Contentful configuration" }, { status: 500 });
  }

  const query = `
    query {
      bookCollection(limit: ${limit}, skip: ${skip}, order: title_DESC) {
        total
        items {
          ${BOOK_GRAPHQL_FIELDS}
        }
      }
    }
  `;

  try {
    const res = await fetch(`https://graphql.contentful.com/content/v1/spaces/${spaceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
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
