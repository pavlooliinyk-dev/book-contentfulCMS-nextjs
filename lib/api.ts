
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

async function fetchGraphQL(query: string, preview = false): Promise<any> {
  const response = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
      next: { tags: ["books"] },
    },
  );
  return response.json();
}

export async function getBookBySlug(slug: string, preview: boolean): Promise<any> {
  // Since you don't have a slug field in CMS, we fetch all books and filter by generated slug
  const allBooks = await getAllBooks(preview);
  // console.log("DEBUG: All generated slugs:", allBooks.map(b => b.slug));
  // console.log("DEBUG: Target slug:", slug);
  const found = allBooks.find((book: any) => book.slug === slug);
  // console.log("DEBUG: Found book:", found ? found.title : "NULL");
  return found;
}

export async function getAllBooks(isDraftMode: boolean): Promise<any[]> {
  const entries = await fetchGraphQL(
    `query {
      bookCollection(preview: ${isDraftMode ? "true" : "false"}) {
        items {
          ${BOOK_GRAPHQL_FIELDS}
        }
      }
    }`,
    isDraftMode,
  );
  const items = entries?.data?.bookCollection?.items || [];
  
  // Generate virtual slugs from titles
  return items.map((book: any) => ({
    ...book,
    slug: book.title
      ? book.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      : "",
  }));
}

export async function getHomePage(preview: boolean): Promise<any> {
  const entry = await fetchGraphQL(
    `query {
      homePageCollection(preview: ${preview ? "true" : "false"}, limit: 1) {
        items {
          title
          heroBanner {
            url
          }
          imageWithTextSection
        }
      }
    }`,
    preview,
  );
  return entry?.data?.homePageCollection?.items?.[0];
}
