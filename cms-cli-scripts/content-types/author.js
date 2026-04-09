/**
 * Author Content Type
 * Stores author information with bio and avatar
 */
module.exports = function (migration) {
  const author = migration
    .createContentType("author")
    .name("Author")
    .displayField("name")
    .description("Book authors with biographical information");

  author
    .createField("name")
    .name("Name")
    .type("Symbol")
    .required(true);

  author
    .createField("bio")
    .name("Bio")
    .type("RichText");

  author
    .createField("avatar")
    .name("Avatar")
    .type("Link")
    .linkType("Asset");
};
