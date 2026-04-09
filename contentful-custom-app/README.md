# Contentful API Usage Dashboard

Displays API usage statistics in your Contentful space with quota monitoring and visual alerts.

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

### Step 3: Create App in Contentful

1. **Apps** → **Manage app definitions** → **Create app**
2. Name: API Usage Dashboard, URL: `http://localhost:3001`
3. Enable locations: **Home** + **App configuration**
4. Save

### Step 4: Install & View

**Apps** → **Custom apps** → Install → Navigate to **Home**

## Deployment

```bash
npm run build
npx vercel --prod  # or npx netlify deploy --prod --dir=build
```

Update app URL in Contentful to production URL. Requires HTTPS.


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
