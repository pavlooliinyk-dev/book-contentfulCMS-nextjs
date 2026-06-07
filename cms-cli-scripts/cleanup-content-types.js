/**
 * Cleanup Script - Remove existing content types before migration
 * 
 * This script deletes existing content types from Contentful to allow
 * fresh migration runs without "already exists" errors.
 * 
 * Usage: node cms-cli-scripts/cleanup-content-types.js
 */

const contentfulManagement = require('contentful-management');
require('dotenv').config();

const client = contentfulManagement.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

const CONTENT_TYPES_TO_DELETE = [
  'taxonomyTerm',
  'author',
  'book',
  'homePage',
  'quiz',
];

async function cleanupContentTypes() {
  try {
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || 'master');

    console.log('🧹 Starting cleanup of content types...\n');

    for (const contentTypeId of CONTENT_TYPES_TO_DELETE) {
      try {
        // First, delete all entries of this content type
        console.log(`Cleaning entries for ${contentTypeId}...`);
        const entries = await environment.getEntries({
          content_type: contentTypeId,
          limit: 100
        });

        for (const entry of entries.items) {
          try {
            if (entry.isPublished && entry.isPublished()) {
              await entry.unpublish();
            }
            await entry.delete();
            console.log(`  ✔ Deleted entry: ${entry.fields.title?.['en-US'] || entry.fields.name?.['en-US'] || entry.sys.id}`);
          } catch (err) {
            console.log(`  ⊘ Skipped entry: ${err.message}`);
          }
        }

        // Then delete the content type
        const contentType = await environment.getContentType(contentTypeId);
        
        // Unpublish if published
        if (contentType.isPublished && contentType.isPublished()) {
          await contentType.unpublish();
          console.log(`✔ Unpublished: ${contentTypeId}`);
        }

        // Delete
        await contentType.delete();
        console.log(`✔ Deleted content type: ${contentTypeId}\n`);
      } catch (error) {
        if (error.status === 404) {
          console.log(`⊘ Not found (skip): ${contentTypeId}\n`);
        } else {
          console.error(`✗ Error deleting ${contentTypeId}:`, error.message, '\n');
        }
      }
    }

    console.log('✅ Cleanup complete! You can now run: npm run migrate');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupContentTypes();
