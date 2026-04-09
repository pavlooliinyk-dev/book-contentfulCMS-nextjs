
import { BOOK_GRAPHQL_FIELDS, TAXONOMY_TERM_GRAPHQL_FIELDS, HOME_PAGE_GRAPHQL_FIELDS } from './graphql/fragments';
import { 
  GraphQLResponse, 
  BookCollectionData, 
  TaxonomyCollectionData, 
  HomePageCollectionData,
  Book,
  BookRaw,
  TaxonomyTerm,
  HomePage
} from './types';
import { 
  BOOKS_DEFAULT_LIMIT, 
  TAXONOMIES_MAX_LIMIT 
} from './constants';

export async function fetchGraphQL<T = unknown>(
  query: string, 
  preview = false
): Promise<GraphQLResponse<T>> {
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
  return result as GraphQLResponse<T>;
}

export async function getBookBySlug(
  slug: string, 
  preview: boolean
): Promise<Book | undefined> {
  const result = await fetchGraphQL<BookCollectionData>(
    `query {
      bookCollection(
        where: { slug: "${slug}" },
        limit: 1,
        preview: ${preview ? "true" : "false"}
      ) {
        items {
          ${BOOK_GRAPHQL_FIELDS}
        }
        total
      }
    }`,
    preview,
  );

  const bookRaw = result?.data?.bookCollection?.items?.[0];
  
  if (!bookRaw) {
    return undefined;
  }

  // Transform to Book type
  return {
    ...bookRaw,
    authors: bookRaw.authorsCollection?.items?.map((item) => item.name) || [],
    taxonomies: bookRaw.taxonomiesCollection?.items || [],
  };
}

export async function getAllBooks(
  isDraftMode: boolean, 
  limit = BOOKS_DEFAULT_LIMIT,
  skip = 0,
  taxIds: string[] = []
): Promise<{ items: Book[], total: number }> {
  const whereClause = taxIds.length > 0 
    ? `, where: { genre_contains_all: ${JSON.stringify(taxIds)} }`
    : "";

  const entries = await fetchGraphQL<BookCollectionData>(
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
  
  // Transform to Book type with authors and taxonomies arrays
  const formattedItems: Book[] = items.map((book: BookRaw) => ({
    ...book,
    authors: book.authorsCollection?.items?.map((item) => item.name) || [],
    taxonomies: book.taxonomiesCollection?.items || [],
  }));

  return { items: formattedItems, total };
}

export async function getTaxonomies(preview: boolean): Promise<TaxonomyTerm[]> {
  const entries = await fetchGraphQL<TaxonomyCollectionData>(
    `query {
      taxonomyTermCollection(preview: ${preview ? "true" : "false"}, limit: ${TAXONOMIES_MAX_LIMIT}) {
        items {
          ${TAXONOMY_TERM_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview,
  );
  return entries?.data?.taxonomyTermCollection?.items || [];
}

export async function getHomePage(preview: boolean): Promise<HomePage | null> {
  const entry = await fetchGraphQL<HomePageCollectionData>(
    `query {
      homePageCollection(preview: ${preview ? "true" : "false"}, limit: 1) {
        items {
          ${HOME_PAGE_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview,
  );
  const homePageRaw = entry?.data?.homePageCollection?.items?.[0];
  
  if (!homePageRaw) {
    return null;
  }
  
  // Parse imageWithTextSection if it exists
  let imageWithTextSection: any = null;
  if (homePageRaw.imageWithTextSection) {
    try {
      imageWithTextSection = typeof homePageRaw.imageWithTextSection === 'string' 
        ? JSON.parse(homePageRaw.imageWithTextSection) 
        : homePageRaw.imageWithTextSection;
    } catch (e) {
      console.error('Error parsing imageWithTextSection:', e);
      imageWithTextSection = null;
    }
  }
  
  return {
    title: homePageRaw.title,
    heroBanner: homePageRaw.heroBanner,
    imageWithTextSection,
  };
}
