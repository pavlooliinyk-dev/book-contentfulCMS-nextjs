module.exports = function (migration) {
  const quizAnswer = migration
    .createContentType('quizAnswer')
    .name('Quiz Answer')
    .displayField('text')
    .description('Answer option for quiz questions');

  quizAnswer
    .createField('text')
    .name('Text')
    .type('Text')
    .required(true);

  quizAnswer
    .createField('isCorrect')
    .name('Is Correct')
    .type('Boolean')
    .required(false);

  // optional link to a follow-up question
  quizAnswer
    .createField('nextQuestion')
    .name('Next Question')
    .type('Link')
    .linkType('Entry')
    .required(false)
    .validations([{ 
      linkContentType: ['quizQuestion'], 
      message: "next Question only" }]);

  quizAnswer.changeFieldControl('text', 'builtin', 'single-line', {});
  quizAnswer.changeFieldControl('isCorrect', 'builtin', 'boolean', {});
  quizAnswer.changeFieldControl('nextQuestion', 'builtin', 'entryLinkEditor', {});
};