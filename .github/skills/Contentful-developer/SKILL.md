# Contentful Integration Skill

This skill provides guidance and best practices for integrating Contentful CMS with Next.js applications, specifically handling common pitfalls like Rich Text rendering, TypeScript typing for CMS objects, and Next.js 15 Draft Mode / Async Params.

## Documentation & Resources
https://www.contentful.com/developers/docs/

## Content Retrieval (lib/api.ts)

Always ensure your GraphQL queries are up-to-date with your Contentful models.
- When adding a new field in Contentful, add it to the `*_GRAPHQL_FIELDS` constants.
- Reference `lib/api.ts` for established pattern of fetching data with preview support.

## Component Patterns

### Image Rendering
Use the `CoverImage` component found in `app/components/cover-image.tsx`. It abstracts `ContentfulImage` and handles aspect ratios and hover effects.

### Type Safety for CMS Data
Contentful fields like `taxonomy` or `JSON` fields often return objects that React cannot render directly.
- Use defensive checks: `typeof t === "string" ? t : t?.property`.
- Use `.filter(Boolean)` when mapping over collections that might contain draft items.

### Layout & Sections
Use the positioning logic established in `HeroBook.tsx` for dynamic layouts controlled by CMS data:
- Extract positioning strings (e.g., "left", "right") from taxonomy metadata.
- Use Tailwind classes like `md:flex-row-reverse` for alternating layouts.

## Next.js 15 Specifics

### Draft Mode & Headers
In Next.js 15, `draftMode()` and `headers()` return Promises. 
- Always `await` them: `const { isEnabled } = await draftMode();`.

### Async Params
Page parameters are now Promises.
- Correct prop type: `params: Promise<{ slug: string }>`.
- Usage: `const { slug } = await params;`.

## Migrations (migration/migration.js)

When creating or modifying content types, use the migration script. 
- Run: `contentful space migration migration/migration.js`.
- Ensure `displayField` is set for better UI in the Contentful Web App.


