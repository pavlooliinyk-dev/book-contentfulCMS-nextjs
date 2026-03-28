# Deploying Both Apps with One Command

## Overview

The Contentful API Usage App is now integrated into your main Next.js deployment. When you run `npm run build` in Vercel, it will:

1. ✅ Build the Contentful custom app
2. ✅ Copy it to `public/contentful-app/`
3. ✅ Build the Next.js app
4. ✅ Deploy everything together

## Deployment Steps

### 1. Push to Git

```bash
git add .
git commit -m "Add Contentful app integration"
git push
```

### 2. Vercel Auto-Deploy

Vercel will automatically:
- Run `npm run build` (which builds both apps)
- Deploy to `https://book-contentful-cms-nextjs.vercel.app/`

### 3. Configure Contentful App

In Contentful → Apps → Manage app definitions:

**Frontend URL**: 
```
https://book-contentful-cms-nextjs.vercel.app/contentful-app
```

**Locations** (enable):
- ✅ App configuration screen
- ✅ Page (or Home)

**Save** and **Install** the app in your space.

## Local Development

### Start both servers:

Terminal 1 - Next.js frontend:
```bash
npm run dev
```

Terminal 2 - Contentful app:
```bash
npm run start-app
```

For local Contentful app testing, use:
```
http://localhost:3001
```

## Build Locally

Test the full build process:

```bash
npm run build
```

This runs:
1. `node build-contentful-app.js` - Builds Contentful app to `public/contentful-app/`
2. `next build` - Builds Next.js app

## How It Works

1. **build-contentful-app.js** script:
   - Installs dependencies in `contentful-app/`
   - Builds the Vite app
   - Copies `build/` to `public/contentful-app/`

2. **vercel.json** configures:
   - CORS headers for Contentful integration
   - Proper routing for `/contentful-app/*`

3. **vite.config.ts** sets:
   - `base: '/contentful-app/'` for correct asset paths

## File Structure After Build

```
public/
  └── contentful-app/        # Built Contentful app (git-ignored)
      ├── index.html
      └── assets/
          ├── index-*.css
          └── index-*.js
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build both apps (used by Vercel) |
| `npm run build:contentful-app` | Build only Contentful app |
| `npm run start-app` | Run Contentful app locally |
| `npm run dev` | Run Next.js locally |

## Vercel Configuration

No changes needed in Vercel dashboard. The existing settings work:
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

## Troubleshooting

### App doesn't load in Contentful?
- Check the URL is exactly: `https://book-contentful-cms-nextjs.vercel.app/contentful-app`
- Verify CORS headers in vercel.json
- Check browser console for errors

### Build fails in Vercel?
- Check build logs
- Verify `contentful-app/package.json` dependencies are correct
- Ensure Node.js version compatibility

### Assets not loading?
- Verify `base: '/contentful-app/'` is set in vite.config.ts
- Check that files are in `public/contentful-app/` after build

## Production URL

Once deployed, your Contentful app will be available at:

```
https://book-contentful-cms-nextjs.vercel.app/contentful-app
```

Use this URL in your Contentful app configuration.
