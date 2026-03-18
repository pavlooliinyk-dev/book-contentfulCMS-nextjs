const spaceImport = require("contentful-import");
const exportFile = require("./export.json");
// install first: npm install dotenv
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

// Allow overriding the Contentful Management API host (for EU data residency use https://api.eu.contentful.com)
const { CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_MANAGEMENT_HOST } = process.env;

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_MANAGEMENT_TOKEN) {
  console.log('process.env', process.env);
  
  throw new Error(
    [
      "Parameters missing...",
      "Please run the setup command as follows",
      "CONTENTFUL_SPACE_ID=XXXX CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-XX npm run setup",
    ].join("\n"),
  );
}

const host = CONTENTFUL_MANAGEMENT_HOST || 'api.contentful.com';

spaceImport({
  spaceId: CONTENTFUL_SPACE_ID,
  managementToken: CONTENTFUL_MANAGEMENT_TOKEN,
  host,
  content: exportFile,
  environmentId: 'master',
})
  .then(() => console.log("The content model of your space is set up!"))
  .catch((e) => console.error(e.errors || e));
