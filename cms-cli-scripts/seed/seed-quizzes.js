/**
 * Quiz Seeding Script
 * 
 * Creates sample quiz entries in Contentful CMS with questions and answers
 * 
 * Usage: npm run cms:seed:quizzes
 */

const contentfulManagement = require('contentful-management');
require('dotenv').config();

const client = contentfulManagement.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

const SAMPLE_QUIZZES = [
  {
    fields: {
      title: { 'en-US': 'General Knowledge Quiz' },
      slug: { 'en-US': 'general-knowledge' },
      description: {
        'en-US': {
          nodeType: 'document',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Test your general knowledge with this fun quiz!',
                  marks: [],
                  data: {}
                }
              ]
            }
          ]
        }
      },
      passingScore: { 'en-US': 70 },
      published: { 'en-US': true },
      firstQuestionData: {
        title: 'firstQuestion → Question A',
        text: 'firstQuestion → Question A',
        answerType: 'single',
        answers: [
          { text: 'Paris', isCorrect: true },
          { text: 'London', isCorrect: false },
          { text: 'Berlin', isCorrect: false }
        ]
      },
    }
  },
  {
    fields: {
      title: { 'en-US': 'JavaScript Basics' },
      slug: { 'en-US': 'javascript-basics' },
      description: {
        'en-US': {
          nodeType: 'document',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Check your JavaScript fundamentals knowledge',
                  marks: [],
                  data: {}
                }
              ]
            }
          ]
        }
      },
      passingScore: { 'en-US': 75 },
      published: { 'en-US': true },
      firstQuestionData: { 
        title: 'Placeholder', 
        text: '', answerType: 'single', answers: [

        ] }
    }
  },
  {
    fields: {
      title: { 'en-US': 'React Fundamentals' },
      slug: { 'en-US': 'react-fundamentals' },
      description: {
        'en-US': {
          nodeType: 'document',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Test your understanding of React core concepts',
                  marks: [],
                  data: {}
                }
              ]
            }
          ]
        }
      },
      passingScore: { 'en-US': 80 },
      published: { 'en-US': true },
      firstQuestionData: { title: 'Placeholder', text: '', answerType: 'single', answers: [] }
    }
  }
];

async function seedQuizzes() {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master';

  try {
    const space = await client.getSpace(spaceId);
    console.log(`🌱 Seeding quizzes in space: ${spaceId}\n`);
    
    const environment = await space.getEnvironment(environmentId);

    // Clean up existing quizzes
    console.log('Cleaning up existing quizzes...');
    try {
      const existingQuizzes = await environment.getEntries({
        content_type: 'quiz',
        limit: 100
      });

      for (const item of existingQuizzes.items) {
        if (item.isPublished && item.isPublished()) await item.unpublish();
        await item.delete();
        console.log(`  ✔ Deleted quiz: ${item.fields.title?.['en-US']}`);
      }
    } catch (cleanupErr) {
      console.error('⊘ Cleanup skipped:', cleanupErr.message);
    }

    console.log('\nCreating new quizzes...\n');

    // helper: recursively create question + answers (returns created question id)
    async function createQuestionRecursive(qd) {
      const createdAnswerIds = [];

      if (Array.isArray(qd.answers) && qd.answers.length > 0) {
        for (const ans of qd.answers) {
          let childQuestionId = null;
          if (ans.nextQuestionData) {
            // create child question first
            childQuestionId = await createQuestionRecursive(ans.nextQuestionData);
          }

          // create answer entry with optional nextQuestion link
          const answerFields = {
            text: { 'en-US': ans.text || '' },
            isCorrect: { 'en-US': !!ans.isCorrect }
          };
          if (childQuestionId) {
            answerFields.nextQuestion = { 'en-US': { sys: { type: 'Link', linkType: 'Entry', id: childQuestionId } } };
          }

          const answerEntry = await environment.createEntry('quizAnswer', { fields: answerFields });
          await answerEntry.publish();
          createdAnswerIds.push(answerEntry.sys.id);
          console.log(`  ✔ Created answer: ${answerEntry.sys.id} (${ans.text})`);
        }
      }

      const answerLinks = createdAnswerIds.map((id) => ({ sys: { type: 'Link', linkType: 'Entry', id } }));
      const questionFields = {
        title: { 'en-US': qd.title || qd.text || 'Question' },
        text: { 'en-US': qd.text || '' },
        answerType: { 'en-US': qd.answerType || 'single' },
        answersCollection: { 'en-US': answerLinks }
      };

      const questionEntry = await environment.createEntry('quizQuestion', { fields: questionFields });
      await questionEntry.publish();
      console.log(`  ✔ Created question: ${questionEntry.sys.id}`);
      return questionEntry.sys.id;
    }

    // Create sample quizzes (create linked answers & questions first)
    for (const quizData of SAMPLE_QUIZZES) {
      try {
        console.log(`\n📝 Preparing quiz: "${quizData.fields.title['en-US']}"`);

        // If quizData contains a firstQuestionData object, create answers and question entries recursively
        if (quizData.fields.firstQuestionData) {
          const firstQuestionId = await createQuestionRecursive(quizData.fields.firstQuestionData);
          quizData.fields.firstQuestion = { 'en-US': { sys: { type: 'Link', linkType: 'Entry', id: firstQuestionId } } };
          delete quizData.fields.firstQuestionData;
        }

        console.log(`\n📝 Creating quiz: "${quizData.fields.title['en-US']}"`);
        console.log(`   Fields keys: ${Object.keys(quizData.fields).join(', ')}`);

        const entry = await environment.createEntry('quiz', quizData);
        console.log(`✔ Entry created with ID: ${entry.sys.id}`);
        const published = await entry.publish();
        console.log(`✔ Created & published quiz: "${published.fields.title['en-US']}"`);
      } catch (error) {
        console.error(`✗ Error creating quiz:`, error.message);
        if (error.status) console.error(`  Status: ${error.status}`);
        if (error.details) console.error(`  Details:`, JSON.stringify(error.details, null, 2));
        console.error(`  Full error:`, error);
      }
    }

        // Create sample quiz results
        // Ensure placeholder asset for quiz results exists (id: img-early-bird)
        const QUIZ_RESULT_ASSET_ID = 'img-early-bird';
        try {
          try {
            await environment.getAsset(QUIZ_RESULT_ASSET_ID);
            console.log(`Using existing asset for quiz results: ${QUIZ_RESULT_ASSET_ID}`);
          } catch (e) {
            console.log(`Creating placeholder asset for quiz results: ${QUIZ_RESULT_ASSET_ID}`);
            let asset = await environment.createAssetWithId(QUIZ_RESULT_ASSET_ID, {
              fields: {
                title: { 'en-US': 'Quiz Result Image' },
                file: { 'en-US': { contentType: 'image/jpeg', fileName: 'quiz-result.jpg', upload: 'https://placehold.co/600x400' } }
              }
            });
            asset = await asset.processForAllLocales();
            await asset.publish();
            console.log(`Created and published quiz result asset: ${QUIZ_RESULT_ASSET_ID}`);
          }
        } catch (e) {
          console.warn('Failed to ensure quiz result asset:', e.message);
        }

        const SAMPLE_RESULTS = [
          {
            sys: {
              id: 'r1-early-bird-athlete',
              contentType: { sys: { id: 'quizResult' } },
            },
            fields: {
              title: { 'en-US': 'Early Bird Athlete' },
              description: { 'en-US': 'You rise with the sun and get moving straight away. Your mornings are your superpower.' },
              image: { 'en-US': { sys: { type: 'Link', linkType: 'Asset', id: QUIZ_RESULT_ASSET_ID } } }
            }
          }
        ];

        console.log('\nCreating sample quiz results...\n');
        for (const resultData of SAMPLE_RESULTS) {
          try {
            console.log(`📝 Creating quiz result: "${resultData.fields.title['en-US']}"`);
            // Try to use createEntryWithId if available to preserve ID, fall back to createEntry
            let resultEntry;
            if (typeof environment.createEntryWithId === 'function' && resultData.sys && resultData.sys.id) {
              resultEntry = await environment.createEntryWithId('quizResult', resultData.sys.id, { fields: resultData.fields });
            } else {
              resultEntry = await environment.createEntry('quizResult', { fields: resultData.fields });
            }
            console.log(`✔ Result entry created with ID: ${resultEntry.sys.id}`);
            try {
              await resultEntry.publish();
              console.log(`✔ Published quiz result: "${resultEntry.fields.title['en-US']}"`);
            } catch (pubErr) {
              console.warn('⚠️ Failed to publish result (may already exist):', pubErr.message);
            }
          } catch (error) {
            console.error(`✗ Error creating quiz result:`, error.message);
            if (error.details) console.error(`  Details:`, JSON.stringify(error.details, null, 2));
          }
        }

        console.log('\n✅ Quiz seeding complete!');
  } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error(error);
        process.exit(1);
  }
}

seedQuizzes();
