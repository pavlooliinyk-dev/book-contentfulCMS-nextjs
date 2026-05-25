# Contentful Star Rating App

Custom Contentful app that renders an interactive star rating field for Integer fields.

It supports:
- App-level configuration for max stars and default star color
- Optional field instance color override
- Rating value storage as Integer
- Read-only behavior for disabled/published contexts

## Prerequisites

- Node.js and npm
- Contentful account and space access
- Contentful CLI installed global

Optional CLI setup:

```bash
npm install -g contentful-cli
contentful login
contentful space use <space-id>
```

Official CLI docs:
https://www.contentful.com/developers/docs/tutorials/cli/installation/

## Local Development

From the repository root:

```bash
npm run setup-app
npm run start-app
```

Or directly in this folder:

```bash
cd contentful-custom-app
npm install
npm start
```

Dev server runs at:
http://localhost:3001

## Contentful App Definition

Create or update your app definition in Contentful:

1. Go to Apps -> Manage app definitions -> Create app
2. Set app name (for example: Goodreads Rating App)
3. Set app URL to http://localhost:3001 for local development
4. Enable locations:
	- App configuration
	- Entry field (Integer)
5. Save and install the app in your space/environment

Then attach the app to an Integer field in your content type editor settings.

## Configuration

In App configuration, set:
- Maximum Stars (default: 5)
- Star Color (default: #FFD700)

The field component also supports an optional instance parameter:
- starColorOverride

## Build and Deployment

Build locally from this folder:

```bash
npm run build
```

Output is created in:
- build/

In this repository, production deployment is typically handled by the root build script, which copies this app into:
- public/contentful-app/

Important:
- The Vite base path is configured in vite.config.ts.
- If you deploy under a different domain/path, update the base value before building.

## Troubleshooting

### App does not load in Contentful
- Confirm the app URL is reachable (HTTPS required in production)
- Verify the app is installed in the correct space/environment
- Check browser console for CORS or CSP errors

### Field UI does not appear
- Confirm the app is attached to an Integer field
- Confirm the Entry field location is enabled in app definition

### Build errors

macOS/Linux:

```bash
rm -rf node_modules build
npm install
npm run build
```

Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules, build
npm install
npm run build
```

## Tech Stack

- React
- TypeScript
- Vite
- Contentful App SDK
- Contentful Forma 36

## License

Private - internal use.

## Support

Contentful App Framework docs:
https://www.contentful.com/developers/docs/extensibility/app-framework/
