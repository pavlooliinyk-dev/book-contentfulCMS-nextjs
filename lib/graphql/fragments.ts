/**
 * Shared GraphQL fragments for Contentful queries
 * Avoids duplication across API routes and ensures consistency
 */

export const TAXONOMY_TERM_GRAPHQL_FIELDS = `
  title
  slug
  type
  sys {
    id
  }
`;

export const TAXONOMY_TERM_WITH_PARENT_FIELDS = `
  ${TAXONOMY_TERM_GRAPHQL_FIELDS}
  parent {
    ... on Entry {
      sys {
        id
      }
    }
  }
`;

export const BOOK_GRAPHQL_FIELDS = `
  title
  slug
  shortDescription {
    json
    links {
      assets {
        block {
          sys {
            id
          }
          url
          description
        }
      }
    }
  }
  coverImage {
    url
  }
  numberOfPages
  rating
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
        ${TAXONOMY_TERM_WITH_PARENT_FIELDS}
      }
    }
  }
`;

export const HOME_PAGE_GRAPHQL_FIELDS = `
  title
  heroBanner {
    url
  }
  imageWithTextSection
`;
