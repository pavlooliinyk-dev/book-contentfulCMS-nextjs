const contentful = require('contentful-management');
require('dotenv').config();

const client = contentful.createClient({ accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN });
const spaceId = process.env.CONTENTFUL_SPACE_ID;
const environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master';
const contentTypes = ['quiz','quizQuestion','quizAnswer','quizResult'];

(async () => {
  try {
    const space = await client.getSpace(spaceId);
    const env = await space.getEnvironment(environmentId);
    for (const ct of contentTypes) {
      try {
        const editor = await env.getEditorInterface(ct);
        console.log(`--- ${ct} controls ---`);
        console.log(JSON.stringify(editor.controls, null, 2));
      } catch (e) {
        console.error(`Failed to fetch editor interface for ${ct}:`, e.message);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();