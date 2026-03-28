# Contentful API Usage App - Quick Start

This directory contains a **standalone Contentful custom app** that displays API usage statistics directly in your Contentful space.

## 🎯 What You'll Get

A custom app showing:
- **Total API requests** for the current month
- **Usage percentage** with visual progress bar  
- **Breakdown by API type** (CDA, CPA, CMA, GraphQL)
- **Quota monitoring** with color-coded warnings

## ⚡ Quick Start

### From the main project directory:

```bash
# Install dependencies for the contentful app
npm run setup-app

# Start the development server
npm run start-app
```

### Or from this directory:

```bash
cd contentful-app
npm install
npm start
```

The app will start at `http://localhost:3001`

## 📝 Install in Contentful

1. **Go to your Contentful space** → **Apps** → **Manage app definitions**

2. **Click "Create app"** and fill in:
   - **Name**: API Usage Dashboard
   - **App URL**: `http://localhost:3001` (for development)
   - **Frontend**: React

3. **Under "Locations"**, enable:
   - ✅ **Home** (to show on space homepage)
   - ✅ **App configuration**

4. **Save** the app definition

5. **Go to Apps** → **Custom apps** → **Install** your app

6. **Navigate to Home** to see your API usage dashboard!

## 🚀 Deploy to Production

### Build the app:

```bash
cd contentful-app
npm run build
```

### Deploy to a hosting service:

**Vercel:**
```bash
npx vercel --prod
```

**Netlify:**
```bash
npx netlify deploy --prod --dir=build
```

Then update your Contentful app definition URL to your production URL.

## 📚 Full Documentation

See [contentful-app/README.md](./contentful-app/README.md) for complete documentation.

## 🔧 Project Structure

```
contentful-app/
├── src/
│   ├── components/
│   │   └── UsageCard.tsx       # Usage display component
│   ├── locations/
│   │   ├── HomePage.tsx        # Home location
│   │   └── ConfigScreen.tsx    # Config screen
│   └── index.tsx               # Entry point
├── contentful-app-manifest.json
├── package.json
└── README.md
```

## ❓ Troubleshooting

**App doesn't load?**
- Ensure app URL is correct in Contentful
- Check browser console for errors
- Verify the app is installed in your space

**No usage data?**
- Requires Management API access
- Data only available for current month

For more help, see the [full README](./contentful-app/README.md).
