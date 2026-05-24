import { Document } from "@contentful/rich-text-types";

export const PositionX = {
  RIGHT: "right",
  LEFT: "left",
} as const;
export const PositionY = {
  TOP: "top",
  BOTTOM: "bottom",
} as const;

export type PositionX = typeof PositionX[keyof typeof PositionX];
export type PositionY = typeof PositionY[keyof typeof PositionY];

// Raw GraphQL response types (as returned from Contentful)
export interface Author {
  name: string;
}

export interface Asset {
  sys: {
    id: string;
  };
  url: string;
  description: string;
}

export interface RichTextContent {
  json: Document;
  links?: {
    assets: {
      block: Asset[];
    };
  };
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
  slug: string;
  shortDescription?: RichTextContent;
  coverImage?: { url: string };
  numberOfPages?: number;
  rating?: number | null;
  externalResourceLink?: string;
  metaUi?: Record<string, { position: PositionX }>;
  authorsCollection?: { items: Author[] };
  taxonomiesCollection?: { items: TaxonomyTerm[] };
  sys?: {
    id: string;
  };
}

// Transformed types (with computed fields like authors array)
export interface Book extends Omit<BookRaw, 'authorsCollection' | 'taxonomiesCollection'> {
  authors: string[];
  taxonomies: TaxonomyTerm[];
}

export interface ImageWithTextSection {
  position?: PositionY | PositionX;
  ratingDisplayConfig?: RatingDisplayConfig;
  text?: string;
}

export interface HomePage {
  title: string;
  heroBanner?: { url: string };
  imageWithTextSection?: ImageWithTextSection;
}

export interface RatingDisplayConfig {
  color: string;
  maxStars: number;
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
      imageWithTextSection?: ImageWithTextSection;
    }>;
  };
}
