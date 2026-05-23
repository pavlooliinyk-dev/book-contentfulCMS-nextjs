#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Setting up Contentful API Usage App...\n');

const appDir = path.join(__dirname, 'contentful-custom-app');

// Check if directory exists
if (!fs.existsSync(appDir)) {
  console.error('❌ Error: contentful-custom-app directory not found!');
  process.exit(1);
}

// Change to app directory
process.chdir(appDir);

console.log('📦 Installing dependencies...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

console.log('✅ Setup complete!\n');
console.log('Next steps:');
console.log('1. cd contentful-custom-app');
console.log('2. npm start');
console.log('3. Create/update a custom app in Contentful pointing to http://localhost:3001');
console.log('\nSee contentful-custom-app/README.md for detailed instructions.');
