const contentful = require('contentful-management');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

async function seedBooks() {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master';
  
  const booksData = JSON.parse(fs.readFileSync(path.join(__dirname, 'books.json'), 'utf8'));

  try {
    const space = await client.getSpace(spaceId);
    console.log(`Starting in space: ${spaceId}`);
    const environment = await space.getEnvironment(environmentId);

    console.log(`Starting seeding in space: ${spaceId} (${environmentId})`);

    // Fetch or create a placeholder asset for the required coverImage
    let assetId;
    try {
      const assets = await environment.getAssets();
      if (assets.items.length > 0) {
        assetId = assets.items[0].sys.id;
        console.log(`Using existing asset for coverImage: ${assetId}`);
      } else {
        console.log('No assets found. Creating a placeholder asset...');
        const asset = await environment.createAsset({
          fields: {
            title: { 'en-US': 'Placeholder Cover' },
            file: {
              'en-US': {
                contentType: 'image/jpeg',
                fileName: 'placeholder.jpg',
                upload: 'https://via.placeholder.com/600x800.jpg'
              }
            }
          }
        });
        const processedAsset = await asset.processForAllLocales();
        const publishedAsset = await processedAsset.publish();
        assetId = publishedAsset.sys.id;
        console.log(`Created and published placeholder asset: ${assetId}`);
      }
    } catch (e) {
      console.error('Error handling placeholder asset:', e.message);
    }

    for (const book of booksData) {
      console.log(`Importing: ${book.title}`);
      
      const entryFields = {
        title: { 'en-US': book.title },
        shortDescription: {
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
                    value: book.shortDescription,
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        },
        numberOfPages: { 'en-US': book.numberOfPages },
        externalResourceLink: { 'en-US': book.externalResourceLink },
        genre: { 'en-US': book.genre },
      };

      if (assetId) {
        entryFields.coverImage = {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: assetId
            }
          }
        };
      }

      const entry = await environment.createEntry('book', {
        fields: entryFields,
      });

      // Automatically publish
      await entry.publish();
      console.log(`Successfully published: ${book.title}`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

if (!process.env.CONTENTFUL_MANAGEMENT_TOKEN || !process.env.CONTENTFUL_SPACE_ID) {
  console.error('Error: CONTENTFUL_MANAGEMENT_TOKEN and CONTENTFUL_SPACE_ID are required in .env');
  process.exit(1);
}

seedBooks();
