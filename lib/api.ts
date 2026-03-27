
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
  metaUi
  authorsCollection(limit: 10) {
    items {
      name
    }
  }
  taxonomiesCollection(limit: 10) {
    items {
      ... on Entry {
        __typename
        sys {
          id
        }
      }
      ... on TaxonomyTerm {
        title
        slug
        type
        parent {
          ... on Entry {
            sys {
              id
            }
          }
        }
      }
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
  
  const result = await response.json();
  if (result.errors) {
    console.error("GraphQL Errors:", JSON.stringify(result.errors, null, 2));
  }
  return result;
}

export async function getBookBySlug(slug: string, preview: boolean): Promise<any> {
  // Since you don't have a slug field in CMS, we fetch many books and filter by generated slug
  // Limit to 20 to avoid "TOO_COMPLEX_QUERY" error while still finding the slug
  const { items: allBooks } = await getAllBooks(preview, 20);
  const found = allBooks.find((book: any) => book.slug === slug);
  return found;
}

export async function getAllBooks(
  isDraftMode: boolean, 
  limit = 5,
  skip = 0,
  taxIds: string[] = []
): Promise<{ items: any[], total: number }> {
  const whereClause = taxIds.length > 0 
    ? `, where: { genre_contains_all: ${JSON.stringify(taxIds)} }`
    : "";

  const entries = await fetchGraphQL(
    `query {
      bookCollection(
        preview: ${isDraftMode ? "true" : "false"}, 
        limit: ${limit}, 
        skip: ${skip},
        order: title_DESC
        ${whereClause}
      ) {
        total
        items {
          ${BOOK_GRAPHQL_FIELDS}
        }
      }
    }`,
    isDraftMode,
  );
  const items = entries?.data?.bookCollection?.items || [];
  const total = entries?.data?.bookCollection?.total || 0;
  
  // Generate virtual slugs from titles
  const formattedItems = items.map((book: any) => ({
    ...book,
    authors: book.authorsCollection?.items?.map((item: any) => item.name) || [],
    taxonomies: book.taxonomiesCollection?.items || [],
    slug: book.title
      ? book.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      : "",
  }));

  return { items: formattedItems, total };
}

export async function getTaxonomies(preview: boolean): Promise<any[]> {
  const entries = await fetchGraphQL(
    `query {
      taxonomyTermCollection(preview: ${preview ? "true" : "false"}, limit: 50) {
        items {
          title
          slug
          type
          sys {
            id
          }
        }
      }
    }`,
    preview,
  );
  return entries?.data?.taxonomyTermCollection?.items || [];
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
