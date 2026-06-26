
import { BOOK_GRAPHQL_FIELDS, TAXONOMY_TERM_GRAPHQL_FIELDS, HOME_PAGE_GRAPHQL_FIELDS } from './graphql/fragments';
import { GET_QUIZ_BY_SLUG, GET_ALL_QUIZZES, GET_FEATURED_QUIZZES } from './graphql/quiz-fragments';
import { 
  GraphQLResponse, 
  BookCollectionData, 
  TaxonomyCollectionData, 
  HomePageCollectionData,
  Book,
  BookRaw,
  TaxonomyTerm,
  HomePage,
  RatingDisplayConfig,
  ImageWithTextSection,
  Quiz,
  QuizCollectionData
} from './types';
import { 
  BOOKS_DEFAULT_LIMIT, 
  TAXONOMIES_MAX_LIMIT,
  DEFAULT_RATING_COLOR,
  DEFAULT_RATING_MAX_STARS
} from './constants';
import { QuizResultData } from './qr-code-utils';

function isValidMaxStars(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 10;
}

export async function fetchGraphQL<T = unknown>(
  query: string, 
  preview = false,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const environment = process.env.CONTENTFUL_ENVIRONMENT || 'nuutrt4cwach';
  const url = `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/${environment}`
  const response = await fetch(
    url,
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
      body: JSON.stringify({ query, variables }),
      next: { tags: ["books"] },
    },
  );
  
  const result = await response.json();

  console.log("Home Page Data:", url);
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
    `query GetBookBySlug($slug: String!) {
      bookCollection(
        where: { slug: $slug },
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
    { slug },
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
  const variables: Record<string, unknown> = { limit, skip };
  if (taxIds.length > 0) {
    variables.where = { genre_contains_all: taxIds };
  }

  const entries = await fetchGraphQL<BookCollectionData>(
    `query GetAllBooks($limit: Int!, $skip: Int!, $where: BookFilter) {
      bookCollection(
        preview: ${isDraftMode ? "true" : "false"}, 
        limit: $limit, 
        skip: $skip,
        order: title_DESC,
        where: $where
      ) {
        total
        items {
          ${BOOK_GRAPHQL_FIELDS}
        }
      }
    }`,
    isDraftMode,
    variables,
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
  
  console.log("Home Page Data:", homePageRaw);

  if (!homePageRaw) {
    return null;
  }
  
  // Parse imageWithTextSection if it exists
  let imageWithTextSection: ImageWithTextSection | undefined;
  if (homePageRaw.imageWithTextSection) {
    try {
      imageWithTextSection = typeof homePageRaw.imageWithTextSection === 'string' 
        ? JSON.parse(homePageRaw.imageWithTextSection) 
        : homePageRaw.imageWithTextSection;
    } catch (e) {
      console.error('Error parsing imageWithTextSection:', e);
      imageWithTextSection = undefined;
    }
  }
  
  return {
    title: homePageRaw.title,
    heroBanner: homePageRaw.heroBanner,
    imageWithTextSection,
  };
}

export async function getRatingDisplayConfig(preview: boolean): Promise<RatingDisplayConfig> {
  const homePage = await getHomePage(preview);
  const rawConfig: Partial<RatingDisplayConfig> = homePage?.imageWithTextSection?.ratingDisplayConfig || {};

  const color = typeof rawConfig.color === 'string' ? rawConfig.color : DEFAULT_RATING_COLOR;
  const maxStars = isValidMaxStars(rawConfig.maxStars)
    ? rawConfig.maxStars
    : DEFAULT_RATING_MAX_STARS;

  return { color, maxStars };
}

// Quiz Functions

export async function getQuizBySlug(slug: string, preview = false): Promise<Quiz | null> {
  const result = await fetchGraphQL<QuizCollectionData>(
    GET_QUIZ_BY_SLUG,
    preview,
    { slug, locale: "en-US" },
  );

  return result?.data?.quizCollection?.items?.[0] || null;
}

export async function getAllQuizzes(
  preview = false,
  limit = 10,
  skip = 0
): Promise<{ quizzes: Quiz[]; total: number }> {
  const result = await fetchGraphQL<QuizCollectionData>(
    GET_ALL_QUIZZES,
    preview,
    { limit, skip },
  );

  return {
    quizzes: result?.data?.quizCollection?.items || [],
    total: result?.data?.quizCollection?.total || 0,
  };
}

export async function getFeaturedQuizzes(preview = false, limit = 6): Promise<Quiz[]> {
  const result = await fetchGraphQL<QuizCollectionData>(
    GET_FEATURED_QUIZZES,
    preview,
    { limit },
  );

  return result?.data?.quizCollection?.items || [];
}

const GET_QUIZ_RESULT_BY_ID = `
  query GetQuizResult($slug: String!) {
    quizResult(id: $slug) {
      title
      description
    }
  }
`;

export interface QuizResultDataCMS {
  title: string;
  description: string;
}
export async function getQuizResultById(slug: string, preview = false): Promise<QuizResultDataCMS | null> {
  const result = await fetchGraphQL<{ quizResult: QuizResultDataCMS }>(
    GET_QUIZ_RESULT_BY_ID,
    preview,
    { slug, locale: "en-US" },
  );

  console.log('getQuizResultById: result:', result);

  return result?.data?.quizResult || null;
}
