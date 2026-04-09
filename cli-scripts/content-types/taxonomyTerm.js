/**
 * TaxonomyTerm Content Type
 * Manages genre, audience, and language taxonomies with hierarchical parent relationships
 */
module.exports = function (migration) {
  const taxonomyTerm = migration
    .createContentType("taxonomyTerm")
    .name("Taxonomy Term")
    .displayField("title")
    .description("Taxonomy terms for categorizing content (genres, audiences, languages)");

  taxonomyTerm
    .createField("title")
    .name("Title")
    .type("Symbol")
    .required(true);

  taxonomyTerm
    .createField("slug")
    .name("Slug")
    .type("Symbol")
    .required(true);

  taxonomyTerm
    .createField("type")
    .name("Type")
    .type("Symbol")
    .required(true)
    .validations([
      { in: ["genre", "audience", "language"] }
    ]);

  taxonomyTerm
    .createField("parent")
    .name("Parent")
    .type("Link")
    .linkType("Entry")
    .validations([
      { linkContentType: ["taxonomyTerm"] }
    ]);
};
