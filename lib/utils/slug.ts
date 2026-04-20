/**
 * Utility functions for slug generation
 */

/**
 * Generates a URL-friendly slug from a title
 * @param title - The title to convert to a slug
 * @returns A lowercase, hyphenated slug without special characters
 * 
 * @example
 * generateSlugFromTitle("The Great Gatsby") // "the-great-gatsby"
 * generateSlugFromTitle("1984: A Novel!") // "1984-a-novel"
 */
export function generateSlugFromTitle(title: string | undefined): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}
