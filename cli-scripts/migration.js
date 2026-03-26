module.exports = function (migration) {
  // TaxonomyTerm Content Type
  const taxonomyTerm = migration
    .createContentType("taxonomyTerm")
    .name("Taxonomy Term")
    .displayField("title");

  taxonomyTerm.createField("title").name("Title").type("Symbol").required(true);
  taxonomyTerm.createField("slug").name("Slug").type("Symbol").required(true);
  taxonomyTerm.createField("type").name("Type").type("Symbol").required(true).validations([
    { in: ["genre", "audience", "language"] }
  ]);
  taxonomyTerm.createField("parent").name("Parent").type("Link").linkType("Entry").validations([
    { linkContentType: ["taxonomyTerm"] }
  ]);

  // Author Content Type
  const author = migration
    .createContentType("author")
    .name("Author")
    .displayField("name");

  author.createField("name").name("Name").type("Symbol").required(true);
  author.createField("bio").name("Bio").type("RichText");
  author.createField("avatar").name("Avatar").type("Link").linkType("Asset");

  // Book Content Type
  const book = migration
    .createContentType("book")
    .name("Book")
    .displayField("title");

  book.createField("title").name("Title").type("Symbol").required(true);

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

  book.createField("numberOfPages").name("Number of Pages").type("Integer");
  book.createField("externalResourceLink").name("External Resource Link").type("Symbol");
  
  book
    .createField("authors")
    .name("Author(s)")
    .type("Array")
    .items({
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["author"] }],
    });

  book.createField("genre").name("Genre").type("Array").items({ type: "Symbol" });

  book
    .createField("taxonomies")
    .name("Taxonomies")
    .type("Array")
    .items({
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["taxonomyTerm"] }],
    });


  // Home Page Content Type
  const homePage = migration
    .createContentType("homePage")
    .name("Home Page")
    .displayField("title");

  homePage.createField("title").name("Title").type("Symbol").required(true);

  homePage
    .createField("heroBanner")
    .name("Hero Banner")
    .type("Link")
    .linkType("Asset")
    .required(true);

  homePage
    .createField("imageWithTextSection")
    .name("Image With Text Section")
    .type("Object");

  // Book Section Content Type
  const bookSection = migration
    .createContentType("bookSection")
    .name("Book Section")
    .description("A section of the book, which can contain multiple chapters.")
    .displayField("title");

  bookSection.createField("title").name("Title").type("Symbol").required(true);

  bookSection
    .createField("books")
    .name("Books")
    .type("Array")
    .items({
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["book"] }],
    });

  // Author Section Content Type
  const authorSection = migration
    .createContentType("authorSection")
    .name("Author Section")
    .description("A section of the book, which can contain multiple authors.")
    .displayField("name");

  authorSection.createField("name").name("Name").type("Symbol").required(true);
};