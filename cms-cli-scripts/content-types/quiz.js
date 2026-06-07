/**
 * Quiz Content Type
 * Quiz entries with questions, answers, and metadata
 */
module.exports = function (migration) {
  const quiz = migration
    .createContentType("quiz")
    .name("Quiz")
    .displayField("title")
    .description("Quiz entries with questions and scoring configuration");

  quiz
    .createField("title")
    .name("Title")
    .type("Symbol")
    .required(true);

  quiz
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
        message: "Slug must be lowercase alphanumeric with hyphens (e.g., 'general-knowledge')",
      },
    ]);

  quiz
    .createField("description")
    .name("Description")
    .type("RichText")
    .required(false);

  quiz
    .createField("questions")
    .name("Questions")
    .type("Text")
    .required(true);

  quiz
    .createField("passingScore")
    .name("Passing Score")
    .type("Integer")
    .required(true)
    .validations([
      {
        range: {
          min: 0,
          max: 100,
        },
        message: "Passing score must be between 0 and 100",
      },
    ]);

  quiz
    .createField("published")
    .name("Published")
    .type("Boolean")
    .required(true);

  quiz.changeFieldControl("title", "builtin", "single-line", {});
  quiz.changeFieldControl("slug", "builtin", "slug", {});
  quiz.changeFieldControl("description", "builtin", "richTextEditor", {});
  quiz.changeFieldControl("questions", "builtin", "objectsEditor", {});
  quiz.changeFieldControl("passingScore", "builtin", "numberEditor", {});
  quiz.changeFieldControl("published", "builtin", "boolean", {});
};
