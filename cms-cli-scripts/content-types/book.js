/**
 * Book Content Type
 * Main book entity with all metadata, authors, taxonomies, and slug
 */
module.exports = function (migration) {
  const book = migration
    .createContentType("book")
    .name("Book")
    .displayField("title")
    .description("Book entries with metadata, authors, and taxonomies");

  book
    .createField("title")
    .name("Title")
    .type("Symbol")
    .required(true);

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

  book
    .createField("shortDescription")
    .name("Short Description")
    .type("RichText")
    .required(false);

  book
    .createField("coverImage")
    .name("Cover Image")
    .type("Link")
    .linkType("Asset")
    .required(true);

  book
    .createField("numberOfPages")
    .name("Number of Pages")
    .type("Integer");

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

  book
    .createField("externalResourceLink")
    .name("External Resource Link")
    .type("Symbol");

  book
    .createField("metaUi")
    .name("Meta UI")
    .type("Object")
    .required(false);

  book
    .createField("authors")
    .name("Author(s)")
    .type("Array")
    .items({
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["author"] }],
    });

  book
    .createField("genre")
    .name("Genre")
    .type("Array")
    .items({ type: "Symbol" });

  book
    .createField("taxonomies")
    .name("Taxonomies")
    .type("Array")
    .items({
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["taxonomyTerm"] }],
    });
};
