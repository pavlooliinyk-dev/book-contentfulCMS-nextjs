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

    // --- CLEANUP EXTRA BOOKS ---
    console.log("Cleaning up existing books for a fresh seed...");
    const existingBooks = await environment.getEntries({
      content_type: 'book',
      limit: 100
    });
    for (const item of existingBooks.items) {
      if (item.isPublished()) await item.unpublish();
      await item.delete();
      console.log(`  Deleted book: ${item.fields.title?.['en-US']}`);
    }

    // --- CLEANUP EXTRA TAXONOMIES ---
    // Get all existing taxonomies
    const existingTaxonomies = await environment.getEntries({
      content_type: 'taxonomyTerm',
      limit: 100
    });

    // Get a list of slugs that ARE in our current books.json
    const validSlugs = new Set();
    booksData.forEach(book => {
      book.taxonomies?.forEach(taxon => validSlugs.add(taxon.slug));
    });

    console.log(`Found ${existingTaxonomies.items.length} existing taxonomies. Cleaning up ones not in books.json...`);
    for (const item of existingTaxonomies.items) {
      const slugValue = item.fields.slug?.['en-US'];
      if (!validSlugs.has(slugValue)) {
        console.log(`  Deleting stale taxonomy: ${item.fields.title?.['en-US']} (${slugValue})`);
        try {
          if (item.isPublished()) await item.unpublish();
          await item.delete();
        } catch (e) {
          console.error(`    Failed to delete ${slugValue}: ${e.message}`);
        }
      }
    }
    // --------------------------------

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

      // Create and publish taxonomies first if they exist
      const taxonomyLinks = [];
      if (book.taxonomies && Array.isArray(book.taxonomies)) {
        for (const taxon of book.taxonomies) {
          try {
            console.log(`  Creating taxonomy: ${taxon.title}`);
            const taxonFields = {
              title: { 'en-US': taxon.title },
              slug: { 'en-US': taxon.slug },
              type: { 'en-US': taxon.type }
            };
            
            // Check if it already exists to avoid duplicates
            const existing = await environment.getEntries({
              content_type: 'taxonomyTerm',
              'fields.slug[in]': taxon.slug,
              limit: 1
            });

            let taxonEntry;
            if (existing.items.length > 0) {
              taxonEntry = existing.items[0];
              console.log(`    Taxonomy already exists: ${taxon.slug}`);
            } else {
              taxonEntry = await environment.createEntry('taxonomyTerm', {
                fields: taxonFields,
              });
              await taxonEntry.publish();
            }

            taxonomyLinks.push({
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: taxonEntry.sys.id
              }
            });
          } catch (e) {
            console.error(`  Error creating taxonomy ${taxon.title}:`, e.message);
          }
        }
      }
      
      // Create and publish authors first if they exist
      const authorLinks = [];
      if (book.authors && Array.isArray(book.authors)) {
        for (const authorData of book.authors) {
          try {
            const authorName = typeof authorData === 'string' ? authorData : authorData.name;
            const authorBio = authorData.bio || "";
            
            console.log(`  Creating author: ${authorName}`);
            
            // Check if author already exists
            const existing = await environment.getEntries({
              content_type: 'author',
              'fields.name[in]': authorName,
              limit: 1
            });

            let authorEntry;
            if (existing.items.length > 0) {
              authorEntry = existing.items[0];
              console.log(`    Author already exists: ${authorName}`);
            } else {
              const authorFields = {
                name: { 'en-US': authorName },
                bio: {
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
                            value: authorBio,
                            marks: [],
                            data: {},
                          },
                        ],
                      },
                    ],
                  },
                },
              };
              
              if (assetId) {
                authorFields.avatar = {
                  'en-US': {
                    sys: {
                      type: 'Link',
                      linkType: 'Asset',
                      id: assetId
                    }
                  }
                };
              }

              authorEntry = await environment.createEntry('author', {
                fields: authorFields,
              });
              await authorEntry.publish();
            }

            authorLinks.push({
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: authorEntry.sys.id
              }
            });
          } catch (e) {
            console.error(`  Error handling author:`, e.message);
          }
        }
      }
      
      const entryFields = {
        title: { 'en-US': book.title },
        slug: { 'en-US': book.slug },
        shortDescription: {
          'en-US': typeof book.shortDescription === 'string' 
            ? {
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
              }
            : book.shortDescription.json // Use the rich text json directly
        },
        numberOfPages: { 'en-US': book.numberOfPages },
        externalResourceLink: { 'en-US': book.externalResourceLink },
        genre: { 'en-US': book.taxonomies?.map(t => t.title) || [] },
      };

      // Add rating if present
      if (book.rating) {
        entryFields.rating = { 'en-US': book.rating };
      }

      // Add metaUi if present
      if (book.metaUi) {
        entryFields.metaUi = { 'en-US': book.metaUi };
      }

      if (authorLinks.length > 0) {
        entryFields.authors = { 'en-US': authorLinks };
      }

      if (taxonomyLinks.length > 0) {
        entryFields.taxonomies = { 'en-US': taxonomyLinks };
      }

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
