import { Document } from "@contentful/rich-text-types";

export const Position = {
  RIGHT: "right",
  LEFT: "left",
} as const;

export type Position = typeof Position[keyof typeof Position];

// Raw GraphQL response types (as returned from Contentful)
export interface Author {
  name: string;
}

export interface TaxonomyTerm {
  sys: {
    id: string;
  };
  title: string;
  slug?: string;
  type?: string;
  parent?: {
    sys: {
      id: string;
    };
  };
}

export interface BookRaw {
  title: string;
  shortDescription?: { json: Document };
  coverImage?: { url: string };
  numberOfPages?: number;
  rating?: number | null;
  externalResourceLink?: string;
  metaUi?: Record<string, { position: Position }>;
  authorsCollection?: { items: Author[] };
  taxonomiesCollection?: { items: TaxonomyTerm[] };
}

// Transformed types (with computed fields like slug, authors array)
export interface Book extends Omit<BookRaw, 'authorsCollection' | 'taxonomiesCollection'> {
  slug: string;
  authors: string[];
  taxonomies: TaxonomyTerm[];
}

export interface HomePage {
  title: string;
  heroBanner?: { url: string };
  imageWithTextSection?: any; // JSON object parsed from string
}

// GraphQL collection response types
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: Record<string, any>;
  }>;
}

export interface BookCollectionData {
  bookCollection: {
    items: BookRaw[];
    total: number;
  };
}

export interface TaxonomyCollectionData {
  taxonomyTermCollection: {
    items: TaxonomyTerm[];
  };
}

export interface HomePageCollectionData {
  homePageCollection: {
    items: Array<{
      title: string;
      heroBanner?: { url: string };
      imageWithTextSection?: string;
    }>;
  };
}
