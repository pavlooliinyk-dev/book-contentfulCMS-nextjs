# Contentful API Usage Dashboard App

A custom Contentful app that displays your API usage statistics directly in your Contentful space.

## Features

- 📊 **Real-time API usage tracking** - View total API requests for the current month
- 📈 **Visual progress bar** - Monitor usage against your quota with color-coded warnings
- 🔍 **Detailed breakdown** - See usage by API type (CDA, CPA, CMA, GraphQL)
- 🎯 **Quota monitoring** - Track usage against your 100K/month quota
- ⚠️ **Usage alerts** - Visual warning when usage exceeds 80%

## What This App Shows

**Total API requests**: {number}

Total API calls made this month from a 100K/month quota. This number includes CMA, CDA, CPA, and GraphQL requests.

## Installation

### Step 1: Install Dependencies

```bash
cd contentful-app
npm install
```

### Step 2: Run Locally for Development

```bash
npm start
```

This will start a local development server at `http://localhost:3001`.

### Step 3: Create a Custom App Definition in Contentful

1. Go to your Contentful space
2. Navigate to **Apps** → **Manage app definitions**
3. Click **Create app**
4. Fill in the details:
   - **Name**: API Usage Dashboard
   - **App URL** (for local dev): `http://localhost:3001`
   - **App URL** (for production): Your deployed app URL (see deployment section)
5. Under **Locations**, enable:
   - ✅ **Home** - Display the usage dashboard on the space home page
   - ✅ **App configuration** - Allow users to configure the app
6. Save the app definition

### Step 4: Install the App in Your Space

1. Go to **Apps** → **Custom apps**
2. Find your **API Usage Dashboard** app
3. Click **Install**
4. Navigate to **Home** to see your API usage dashboard

## Deployment

### Option 1: Deploy to Vercel

1. Build the app:
```bash
npm run build
```

2. Deploy the `build` folder to Vercel:
```bash
npx vercel --prod
```

3. Update your app definition URL in Contentful to the Vercel URL

### Option 2: Deploy to Netlify

1. Build the app:
```bash
npm run build
```

2. Deploy the `build` folder:
```bash
npx netlify deploy --prod --dir=build
```

3. Update your app definition URL in Contentful to the Netlify URL

### Option 3: Deploy to Contentful's Hosting (Recommended for Custom Apps)

While Contentful doesn't provide built-in hosting for custom apps, you can use any static hosting service. The key requirements are:
- HTTPS support
- CORS headers configured to allow requests from `app.contentful.com`

## How It Works

1. **Authentication**: The app uses the Contentful App SDK which automatically handles authentication with your space
2. **Data Fetching**: Uses the Contentful Management API (via `sdk.cmaAdapter`) to fetch usage statistics
3. **No Backend Required**: All API calls are made directly from the browser using the authenticated SDK
4. **Permissions**: Uses the current user's permissions - no additional tokens needed

## Project Structure

```
contentful-app/
├── src/
│   ├── components/
│   │   └── UsageCard.tsx       # Main usage display component
│   ├── locations/
│   │   ├── HomePage.tsx        # Home page location
│   │   └── ConfigScreen.tsx    # App configuration screen
│   ├── index.tsx               # App entry point
│   └── index.css               # Global styles
├── contentful-app-manifest.json # App manifest
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Development

### Local Development with Hot Reload

```bash
npm start
```

Then update your Contentful app definition to point to `http://localhost:3001`.

### Build for Production

```bash
npm run build
```

The build output will be in the `build` folder.

## Troubleshooting

### App doesn't load in Contentful
- Make sure your app URL is accessible via HTTPS (except for localhost during development)
- Check browser console for CORS errors
- Verify the app is installed in your space

### No usage data showing
- The app requires access to the Contentful Management API
- Check that you have proper permissions in the space
- Usage data is only available for the current month

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules build
npm install
npm run build
```

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Contentful App SDK** - Contentful integration
- **Contentful Forma 36** - Contentful's design system
- **Contentful Management SDK** - API usage data

## License

Private - for internal use

## Support

For issues or questions, consult the [Contentful Apps documentation](https://www.contentful.com/developers/docs/extensibility/app-framework/).
