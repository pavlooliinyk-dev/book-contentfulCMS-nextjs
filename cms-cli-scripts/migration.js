const taxonomyTermMigration = require("./content-types/taxonomyTerm");
const authorMigration = require("./content-types/author");
const bookMigration = require("./content-types/book");
const homePageMigration = require("./content-types/homePage");
const quizModule = require("./content-types/quiz/index");

module.exports = function (migration) {
  taxonomyTermMigration(migration);
  authorMigration(migration);
  bookMigration(migration);
  homePageMigration(migration);
  // run quiz-related migrations via a single entry point
  quizModule(migration);
};