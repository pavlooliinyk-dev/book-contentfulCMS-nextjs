import { Document } from "@contentful/rich-text-types";

export const Position = {
  RIGHT: "right",
  LEFT: "left",
} as const;

export type Position = typeof Position[keyof typeof Position];

export type TaxonomyTerm = {
  sys: {
    id: string;
  };
  title: string;
  slug?: string;
  type?: string;
};

export type Book = {
  title?: string;
  slug?: string;
  shortDescription?: { json?: Document | any };
  coverImage?: { url?: string };
  numberOfPages?: number;
  rating?: number | null;
  authorsCollection?: { items: { name: string }[] };
  externalResourceLink?: string;
  metaUI?: Record<string, {position: Position}> | object;
  authors?: string | { name: string }[];
  taxonomies?: TaxonomyTerm[];
  taxonomiesCollection?: { items: { title: string }[] };
};
