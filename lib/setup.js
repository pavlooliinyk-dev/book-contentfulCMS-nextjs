const spaceImport = require("contentful-import");
const exportFile = require("./export.json");
// install first: npm install dotenv
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const { CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN } = process.env;

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_MANAGEMENT_TOKEN) {
  console.log('process.env', process.env);
  
  throw new Error(
    [
      "Parameters missing...",
      "Please run the setup command as follows",
      "CONTENTFUL_SPACE_ID=XX CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-XX npm run setup",
    ].join("\n"),
  );
}

spaceImport({
  spaceId: CONTENTFUL_SPACE_ID,
  managementToken: CONTENTFUL_MANAGEMENT_TOKEN,
  content: exportFile,
})
  .then(() => console.log("The content model of your space is set up!"))
  .catch((e) => console.error(e));
