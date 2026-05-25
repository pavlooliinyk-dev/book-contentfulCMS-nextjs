# Content Type Migrations

Modular migration scripts for Contentful content model.

## Usage

```bash
npm run migrate  # Create all content types
npm run seed     # Populate sample data
```


## TODO: Implementing Per-Book Cover Image Upload

The seed script currently uses a single placeholder asset for all books. To upload real cover images per book:

1. **Add `coverImageUrl` to each book in `books.json`**
   ```json
   {
     "title": "The Great Gatsby",
     "coverImageUrl": "https://example.com/covers/great-gatsby.jpg"
   }
   ```

2. **Replace the shared placeholder logic** in `seed-books.js` with a per-book asset creation function that accepts `book.coverImageUrl` and `book.title`, calls `environment.createAsset()`, then `.processForAllLocales()` and `.publish()`, and returns the asset `sys.id`

3. **Call the function inside the book loop** — store the returned `assetId` for each book individually

4. **Link the asset to the book entry**
   ```js
   coverImage: {
     'en-US': { sys: { type: 'Link', linkType: 'Asset', id: assetId } }
   }
   ```

5. **Add deduplication** — check `environment.getAssets({ 'fields.title[in]': book.title })` before creating, matching the pattern already used for taxonomies and authors

6. **Fall back to the placeholder** if asset creation fails for a book, so the seed does not abort mid-run

---

## Troubleshooting

- **Content type exists**: Migration uses `createContentType()`. Delete existing types first.
- **Field not showing**: Run migration, refresh Contentful UI.
- **Validation errors**: Check slug pattern and rating range (1-5).

