const taxonomyTermMigration = require("./content-types/taxonomyTerm");
const authorMigration = require("./content-types/author");
const bookMigration = require("./content-types/book");
const homePageMigration = require("./content-types/homePage");

module.exports = function (migration) {
  taxonomyTermMigration(migration);
  authorMigration(migration);
  bookMigration(migration);
  homePageMigration(migration);
};