const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Allow skipping Contentful app build via environment variable
if (process.env.SKIP_CONTENTFUL_APP === 'true') {
  console.log('⏭️  Skipping Contentful app build (SKIP_CONTENTFUL_APP=true)\n');
  process.exit(0);
}

console.log('🏗️  Building Contentful App...\n');

const contentfulAppDir = path.join(__dirname, 'contentful-app');
const buildDir = path.join(contentfulAppDir, 'build');
const publicDir = path.join(__dirname, 'public', 'contentful-app');

// Check if contentful-app directory exists
if (!fs.existsSync(contentfulAppDir)) {
  console.log('⚠️  contentful-app directory not found. Skipping Contentful app build.');
  process.exit(0);
}

// Save current directory
const originalDir = process.cwd();

try {
  // Change to contentful-app directory
  process.chdir(contentfulAppDir);
  console.log(`📂 Working in: ${process.cwd()}\n`);

  // Install dependencies with npm ci for reproducible builds (or npm install as fallback)
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm ci --loglevel=error', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  npm ci failed, falling back to npm install...');
    execSync('npm install --loglevel=error', { stdio: 'inherit' });
  }

  // Verify vite is installed
  const vitePath = path.join(contentfulAppDir, 'node_modules', '.bin', 'vite');
  const vitePathCmd = path.join(contentfulAppDir, 'node_modules', '.bin', 'vite.cmd');
  console.log(`\n🔍 Checking for vite at: ${vitePath}`);
  
  if (!fs.existsSync(vitePath) && !fs.existsSync(vitePathCmd)) {
    throw new Error('Vite not found after npm install. Check package.json dependencies.');
  }

  // Build the app
  console.log('\n🔨 Building app...');
  try {
    execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });
  } catch (buildError) {
    console.error('\n❌ Vite build failed!');
    throw buildError;
  }

  // Change back to original directory for copy operation
  process.chdir(originalDir);

  // Verify build directory exists
  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory not found at ${buildDir}`);
  }

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

} catch (error) {
  console.error('\n❌ Contentful app build failed:');
  console.error(error.message);
  console.error('\n⚠️  The main Next.js app will still be built, but the Contentful app will not be available.');
  console.error('    To fix this, check the contentful-app/ directory and run "npm run build:contentful-app" locally.\n');
  
  // Change back to original directory
  process.chdir(originalDir);
  
  // Exit with 0 to allow Next.js build to continue
  process.exit(0);
}

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
