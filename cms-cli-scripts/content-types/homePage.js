/**
 * HomePage Content Type
 * Singleton content type for homepage configuration
 */
module.exports = function (migration) {
  const homePage = migration
    .createContentType("homePage")
    .name("Home Page")
    .displayField("title")
    .description("Homepage configuration (singleton)");

  homePage
    .createField("title")
    .name("Title")
    .type("Symbol")
    .required(true);

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
};
