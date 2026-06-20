module.exports = function (migration) {
  // Single entry point for quiz-related migrations
  // keep the correct creation order: answers -> questions -> quiz -> results
  const quizAnswerMigration = require('./quizAnswer');
  const quizQuestionMigration = require('./quizQuestion');
  const quizMigration = require('./quiz');
  const quizResultMigration = require('./quizResult');

  quizAnswerMigration(migration);
  quizQuestionMigration(migration);
  quizMigration(migration);
  quizResultMigration(migration);
};