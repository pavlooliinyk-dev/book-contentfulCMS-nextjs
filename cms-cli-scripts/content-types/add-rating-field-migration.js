/**
 * Contentful Migration: Add Rating Field to Book Content Type
 * 
 * This migration adds a 'rating' field to the existing 'book' content type
 * to support the star rating field extension.
 * 
 * To run this migration:
 * npx contentful space migration cms-cli-scripts/add-rating-field-migration.js \
 *   --space-id YOUR_SPACE_ID \
 *   --access-token YOUR_CMA_TOKEN
 * 
 * Or if using environment:
 * npx contentful space migration cms-cli-scripts/add-rating-field-migration.js \
 *   --space-id YOUR_SPACE_ID \
 *   --environment-id YOUR_ENV_ID \
 *   --access-token YOUR_CMA_TOKEN
 */

module.exports = function (migration) {
  const book = migration.editContentType("book");

  // Add rating field as Integer type (required for star rating extension)
  book
    .createField("rating")
    .name("Rating")
    .type("Integer")
    .required(false)
    .validations([
      {
        range: {
          min: 1,
          max: 5,
        },
      },
    ]);

  // Move rating field to appear after numberOfPages
  book.moveField("rating").afterField("numberOfPages");

  // Set the field control to use the "star rating field extension"
  book.changeFieldControl('rating', 'app', 'star-rating-field-extension');

  console.log("✅ Rating field added to book content type");
};
