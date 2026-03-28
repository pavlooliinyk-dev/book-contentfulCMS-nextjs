const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  Building Contentful App...\n');

const contentfulAppDir = path.join(__dirname, 'contentful-app');
const buildDir = path.join(contentfulAppDir, 'build');
const publicDir = path.join(__dirname, 'public', 'contentful-app');

// Ensure we're in the contentful-app directory
process.chdir(contentfulAppDir);

// Install dependencies with npm ci for reproducible builds (or npm install as fallback)
console.log('📦 Installing dependencies...');
try {
  execSync('npm ci', { stdio: 'inherit' });
} catch (error) {
  console.log('⚠️  npm ci failed, falling back to npm install...');
  execSync('npm install', { stdio: 'inherit' });
}

// Build the app using npx to ensure vite is found
console.log('\n🔨 Building app...');
execSync('npx vite build', { stdio: 'inherit' });

// Copy build to public/contentful-app
console.log('\n📁 Copying to public/contentful-app...');

// Remove existing public/contentful-app if it exists
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}

// Copy build directory to public/contentful-app
copyDirectory(buildDir, publicDir);

console.log('✅ Contentful app built successfully!\n');
console.log('📍 App will be available at: /contentful-app\n');

function copyDirectory(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
