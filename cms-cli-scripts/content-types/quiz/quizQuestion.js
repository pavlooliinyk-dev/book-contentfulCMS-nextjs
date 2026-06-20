module.exports = function (migration) {
  const quizQuestion = migration
    .createContentType('quizQuestion')
    .name('Quiz Question')
    .displayField('title')
    .description('A question node used in quizzes');

  quizQuestion
    .createField('title')
    .name('Title')
    .type('Symbol')
    .required(true);

  quizQuestion
    .createField('text')
    .name('Text')
    .type('Symbol')
    .required(false);

  quizQuestion
    .createField('answerType')
    .name('Answer Type')
    .type('Symbol')
    .required(true)
    .validations([{ in: ['single', 'multiple'] }])
    .defaultValue({
        "en-US": "single"
    });

  quizQuestion
    .createField('answersCollection')
    .name('Answers')
    .type('Array')
    .items({ type: 'Link', linkType: 'Entry', "validations": [
          {
            "linkContentType": [
              "quizAnswer"
            ],
            "message": "quiz-answer type only available"
          }
        ], })
    .required(false);

  quizQuestion.changeFieldControl('title', 'builtin', 'single-line', {});
  quizQuestion.changeFieldControl('text', 'builtin', 'single-line', {});
  quizQuestion.changeFieldControl('answerType', 'builtin', 'dropdown', {});
  quizQuestion.changeFieldControl('answersCollection', 'builtin', 'entry-hyperlink', {});
};