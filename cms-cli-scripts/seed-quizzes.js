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
      questions: {
        'en-US': JSON.stringify([
          {
            id: '1',
            question: 'What is the capital of France?',
            questionType: 'single',
            order: 1,
            answers: [
              { id: 'a1', text: 'Paris', isCorrect: true },
              { id: 'a2', text: 'London', isCorrect: false },
              { id: 'a3', text: 'Berlin', isCorrect: false },
              { id: 'a4', text: 'Madrid', isCorrect: false }
            ]
          },
          {
            id: '2',
            question: 'Which of these planets are in our solar system?',
            questionType: 'multiple',
            order: 2,
            answers: [
              { id: 'b1', text: 'Mars', isCorrect: true },
              { id: 'b2', text: 'Venus', isCorrect: true },
              { id: 'b3', text: 'Proxima Centauri', isCorrect: false },
              { id: 'b4', text: 'Jupiter', isCorrect: true }
            ]
          },
          {
            id: '3',
            question: 'What is the largest ocean on Earth?',
            questionType: 'single',
            order: 3,
            answers: [
              { id: 'c1', text: 'Atlantic Ocean', isCorrect: false },
              { id: 'c2', text: 'Indian Ocean', isCorrect: false },
              { id: 'c3', text: 'Arctic Ocean', isCorrect: false },
              { id: 'c4', text: 'Pacific Ocean', isCorrect: true }
            ]
          }
        ])
      },
      passingScore: { 'en-US': 70 },
      published: { 'en-US': true },
      
      firstQuestion: {
        "title": "firstQuestion → Question A",
        "text": "firstQuestion → Question A",
        "answerType": "single",
        "answersCollection": {
          "items": [
            {
              "text": "Answer 1 → nextQuestion → Question B",
              "nextQuestion": {
                "sys": {
                  "id": "4DqJKTQWN8LGYgstrwkY9L"
                }
              }
            },
            {
              "nextQuestion": null,
              "text": "Answer 2 → nextQuestion → Question C"
            },
            {
              "nextQuestion": null,
              "text": "Answer 3 → nextQuestion → Question B"
            }
          ]
        }
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
      questions: {
        'en-US': JSON.stringify([
          {
            id: '1',
            question: 'What does "const" do in JavaScript?',
            questionType: 'single',
            order: 1,
            answers: [
              { id: 'a1', text: 'Declares a constant variable', isCorrect: true },
              { id: 'a2', text: 'Declares a temporary variable', isCorrect: false },
              { id: 'a3', text: 'Declares a global variable', isCorrect: false },
              { id: 'a4', text: 'Nothing - it is not a real keyword', isCorrect: false }
            ]
          },
          {
            id: '2',
            question: 'Which of these are valid JavaScript data types?',
            questionType: 'multiple',
            order: 2,
            answers: [
              { id: 'b1', text: 'string', isCorrect: true },
              { id: 'b2', text: 'boolean', isCorrect: true },
              { id: 'b3', text: 'character', isCorrect: false },
              { id: 'b4', text: 'object', isCorrect: true }
            ]
          }
        ])
      },
      passingScore: { 'en-US': 75 },
      published: { 'en-US': true }
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
      questions: {
        'en-US': JSON.stringify([
          {
            id: '1',
            question: 'What is a React component?',
            questionType: 'single',
            order: 1,
            answers: [
              { id: 'a1', text: 'A reusable piece of UI', isCorrect: true },
              { id: 'a2', text: 'A JavaScript library', isCorrect: false },
              { id: 'a3', text: 'A CSS stylesheet', isCorrect: false },
              { id: 'a4', text: 'A database table', isCorrect: false }
            ]
          },
          {
            id: '2',
            question: 'Which of these are hooks in React?',
            questionType: 'multiple',
            order: 2,
            answers: [
              { id: 'b1', text: 'useState', isCorrect: true },
              { id: 'b2', text: 'useEffect', isCorrect: true },
              { id: 'b3', text: 'useRender', isCorrect: false },
              { id: 'b4', text: 'useContext', isCorrect: true }
            ]
          }
        ])
      },
      passingScore: { 'en-US': 80 },
      published: { 'en-US': true }
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

    // Create sample quizzes
    for (const quizData of SAMPLE_QUIZZES) {
      try {
        console.log(`\n📝 Creating quiz: "${quizData.fields.title['en-US']}"`);
        console.log(`   Fields keys: ${Object.keys(quizData.fields).join(', ')}`);
        
        const entry = await environment.createEntry('quiz', quizData);

        // -----------
        // TODO: Create and publish taxonomies first if they exist
        // const answersLinks = [];
        // if (quizData.firstQuestion.answersCollection && Array.isArray(quizData.firstQuestion.answersCollection.items)) {
        //   for (const answer of quizData.firstQuestion.answersCollection.items) {
        //     try {
        //       console.log(`  Creating answer: ${answer.text}`);
        //       const answerFields = {
        //         text: { 'en-US': answer.text },
        //         nextQuestion: answer.nextQuestion ? {
        //           sys: {
        //             type: 'Link',
        //             linkType: 'Entry',
        //             id: answer.nextQuestion.sys.id
        //           }
        //         } : null
        //       };
              
        //       // todo: Check if it already exists to avoid duplicates
        //       let taxonEntry = await environment.createEntry('answersCollection', {
        //           fields: answerFields,
        //         });
        //         await taxonEntry.publish();

        //       answersLinks.push({
        //         sys: {
        //           type: 'Link',
        //           linkType: 'Entry',
        //           id: taxonEntry.sys.id
        //         }
        //       });
        //     } catch (e) {
        //       console.error(`  Error creating taxonomy ${taxon.title}:`, e.message);
        //     }
        //   }
        // }
        //
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

    console.log('\n✅ Quiz seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedQuizzes();
