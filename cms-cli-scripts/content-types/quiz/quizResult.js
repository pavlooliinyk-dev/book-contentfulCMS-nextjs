module.exports = function (migration) {
  const quizResult = migration
    .createContentType('quizResult')
    .name('Quiz Result')
    .displayField('title')
    .description('Possible quiz result with title, description and image');

  quizResult
    .createField('title')
    .name('Title')
    .type('Symbol')
    .required(true);

  quizResult
    .createField('description')
    .name('Description')
    .type('Text')
    .required(false);

  quizResult
    .createField('image')
    .name('Image')
    .type('Link')
    .linkType('Asset')
    .required(false);

  quizResult.changeFieldControl('title', 'builtin', 'singleLine', {});
  quizResult.changeFieldControl('description', 'builtin', 'multipleLine', {});
  quizResult.changeFieldControl('image', 'builtin', 'assetLinkEditor', {});
};