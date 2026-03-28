# Vercel Build Troubleshooting

If your Vercel build is failing with the Contentful app, here are solutions:

## Quick Fix: Skip Contentful App Build

Add this environment variable in Vercel:

1. Go to your Vercel project → Settings → Environment Variables
2. Add: `SKIP_CONTENTFUL_APP` = `true`
3. Redeploy

This will skip the Contentful app build and only deploy your Next.js frontend.

## Full Fix: Debug the Build

The improved build script now provides better error messages. Check your Vercel build logs for:

1. **"Vite not found after npm install"** - Dependencies issue
   - Solution: Check contentful-app/package.json has all dependencies

2. **"Build directory not found"** - Vite build failed
   - Solution: Check Vercel logs for the actual vite error
   - Common cause: Import errors in source files

3. **"npm ci failed"** - Lock file issue
   - Solution: Commit contentful-app/package-lock.json
   - Or let it fall back to npm install automatically

## Graceful Degradation

The build script now exits with code 0 (success) even if the Contentful app build fails. This means:
- ✅ Your Next.js site will still deploy
- ⚠️ The Contentful app won't be available at /contentful-app
- 📝 Error details will be in the build logs

## Recommended Setup

1. **First deployment**: Set `SKIP_CONTENTFUL_APP=true` to get your Next.js site live
2. **Test locally**: Run `npm run build` to ensure Contentful app builds
3. **Fix any issues**: Check contentful-app dependencies and source files
4. **Remove skip flag**: Once local build works, remove the environment variable
5. **Redeploy**: Push to git and let Vercel build both apps

## Common Issues

### TypeScript Type Errors for Contentful App

**Error**: `Cannot find module '@contentful/app-sdk'` during Next.js build

**Solution**: Already fixed! The `tsconfig.json` now excludes the `contentful-app/` directory from Next.js type checking. The contentful-app has its own separate TypeScript configuration.

### Node Version Mismatch
Ensure Vercel uses Node 18 or higher:
- Project Settings → Node.js Version → 18.x or 20.x

### Missing Dependencies
Make sure contentful-app/package-lock.json is committed:
```bash
cd contentful-app
npm install
git add package-lock.json
git commit -m "Add contentful-app lock file"
git push
```

### Import Errors
Check that all imports in contentful-app/src are correct and don't reference missing files.

## Test Build Command Locally

Simulate Vercel's build:

```bash
# Clear everything
rm -rf .next public/contentful-app contentful-app/build contentful-app/node_modules

# Run build
npm run build
```

If this works locally but fails in Vercel, it's likely an environment difference.
