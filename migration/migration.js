module.exports = function (migration) {
  // Author Content Type
  const author = migration
    .createContentType("author")
    .name("Author")
    .displayField("name");

  author.createField("name").name("Name").type("Symbol").required(true);

  author
    .createField("picture")
    .name("Picture")
    .type("Link")
    .linkType("Asset")
    .required(true);

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

  book.createField("taxonomy").name("Taxonomy").type("Object");

  book
    .createField("authorsCollection")
    .name("Authors")
    .type("Array")
    .items({
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: ["author"] }],
    });

  book.createField("genre").name("Genre").type("Array").items({ type: "Symbol" });

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