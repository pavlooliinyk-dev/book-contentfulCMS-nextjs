/**
 * Migration to add slug field to Book content type
 * Run: contentful space migration cli-scripts/add-slug-field-migration.js
 */

module.exports = function (migration) {
  const book = migration.editContentType("book");

  // Add slug field to Book content type
  book
    .createField("slug")
    .name("Slug")
    .type("Symbol")
    .required(true)
    .validations([
      {
        unique: true,
      },
      {
        regexp: {
          pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
          flags: null,
        },
        message: "Slug must be lowercase alphanumeric with hyphens (e.g., 'the-great-gatsby')",
      },
    ]);

  // Transform existing entries to generate slug from title
  book.transformEntries({
    from: ["title"],
    to: ["slug"],
    transformEntryForLocale: function (fromFields, currentLocale) {
      // Generate slug from title
      const title = fromFields.title?.[currentLocale];
      
      if (!title) {
        return { slug: "untitled" };
      }

      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens

      return {
        slug: slug || "untitled",
      };
    },
  });
};
