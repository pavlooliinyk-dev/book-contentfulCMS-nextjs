# Next.js Book Library with Contentful CMS

A modern, full-featured book library application built with **Next.js 15** and **Contentful CMS**, showcasing best practices for headless CMS integration, server components, and dynamic content rendering.

## 📚 What This Project Does

This is a **book catalog application** featuring:
- 📖 **Book Library** with filtering, pagination, and infinite scroll
- 🔍 **Search functionality** (Algolia integration ready)
- ⭐ **Star Ratings** with custom Contentful app
- 🎨 **Dynamic layouts** controlled from CMS
- 📝 **Rich text rendering** for book descriptions
- 👤 **Author management** with bio and avatar
- 🏷️ **Taxonomy system** (genres, audiences, languages)
- 🚀 **Draft Mode** for content preview
- 🔄 **On-Demand Revalidation** with webhooks
- 📊 **API Usage Dashboard** (custom Contentful app)

## 🎯 Quick Start (New Developers)

### Prerequisites
- Node.js 18+ and npm
- A [Contentful account](https://www.contentful.com/sign-up/) (free tier works)
- Git

### Installation & Setup

```bash
# 1. Clone and install dependencies
npm install

# 2. Set up environment variables (see Configuration section below)
# Copy the values from .env.local (already in this repo) or create your own

# 3. Set up Contentful content model and seed data
npm run migrate  # Creates content types (Book, Author, TaxonomyTerm, HomePage)
npm run seed     # Populates with 7 sample books, authors, and taxonomies

# 4. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

### 🆕 Contentful Custom App (API Usage Dashboard)

Monitor your Contentful API usage directly in your space:

```bash
npm run setup-app   # Install app dependencies
npm run start-app   # Start at localhost:3001
```

See [CONTENTFUL-APP-GUIDE.md](./CONTENTFUL-APP-GUIDE.md) for installation instructions.

---

## 🏗️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Contentful** - Headless CMS
- **GraphQL** - API queries
- **Tailwind CSS** - Styling
- **Algolia** - Search (optional)
- **Vercel** - Deployment platform

## Demo

### [https://book-contentful-cms-nextjs.vercel.app/](https://book-contentful-cms-nextjs.vercel.app/)

---

## 📂 Project Structure

```
cms-contentful-app/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page (shows hero + book list)
│   ├── layout.tsx                # Root layout
│   ├── books/
│   │   ├── page.tsx              # Book listing page with filters
│   │   └── [slug]/page.tsx       # Book detail page (PDP)
│   ├── _components/              # Shared React components
│   │   ├── book-list/            # Book grid with pagination/infinite scroll
│   │   ├── hero-book/            # Featured book section
│   │   ├── star-rating-display.tsx
│   │   └── ...
│   └── api/                      # API routes
│       ├── books/route.ts        # Book data endpoint
│       ├── draft/route.ts        # Enable draft mode
│       └── revalidate/route.ts   # Webhook handler
│
├── lib/
│   ├── api.ts                    # Contentful GraphQL queries
│   ├── constants.ts              # App constants
│   └── hooks/                    # Custom React hooks
│
├── cms-cli-scripts/                  # Contentful automation
│   ├── setup.js                  # Initialize content model
│   ├── seed-books.js             # Populate sample data
│   ├── migration.js              # Content type definitions
│   └── books.json                # Sample book data
│
├── contentful-custom-app/        # Custom Contentful apps
│   └── src/
│       ├── locations/
│       │   ├── ConfigScreen.tsx
│       │   └── StarRatingField.tsx
│       └── index.tsx
│
├── public/                       # Static assets
├── .env.local                    # Environment variables (DO NOT COMMIT)
└── package.json                  # Dependencies & scripts
```

## 🔧 Configuration

### Environment Variables

The `.env.local` file contains all necessary API keys:

```bash
# Contentful Space Configuration
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_cda_token
CONTENTFUL_PREVIEW_ACCESS_TOKEN=your_preview_token
CONTENTFUL_MANAGEMENT_TOKEN=your_cma_token  # For API dashboard & migrations

# Next.js Features
CONTENTFUL_PREVIEW_SECRET=my_super_secret
CONTENTFUL_REVALIDATE_SECRET=my_super_secret
CONTENTFUL_ENVIRONMENT=master

# Algolia Search (Optional)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=your_index_name
```

### Getting Your Contentful Credentials

1. **Create a Contentful Space**
   - Go to [Contentful Dashboard](https://app.contentful.com/)
   - Create a new space or use existing

2. **Get API Keys**
   - Navigate to **Settings > API keys**
   - Copy `Space ID`, `Content Delivery API - access token`, and `Content Preview API - access token`

3. **Create Management Token** (for migrations & API dashboard)
   - Go to **Settings > CMA tokens**
   - Click **Create personal access token**
   - Save it to `CONTENTFUL_MANAGEMENT_TOKEN`

---

## 📖 Content Model

The project uses these Contentful content types:

### 1. **Book** (Main Content Type)
| Field | Type | Description |
|-------|------|-------------|
| `title` | Text | Book title (required) |
| `slug` | Text | URL-friendly identifier (unique, auto-validated: `^[a-z0-9]+(?:-[a-z0-9]+)*$`) |
| `shortDescription` | Rich Text | Book description with formatting (bold, italic) |
| `coverImage` | Asset | Cover image (required) |
| `numberOfPages` | Integer | Page count |
| `rating` | Integer | Star rating (1-5, validated in CMS) |
| `externalResourceLink` | Text | External link |
| `authors` | References | Links to Author entries |
| `genre` | Reference | Primary genre category |
| `taxonomies` | References | Additional tags (audience, language, etc.) |
| `metaUi` | Object | UI metadata (e.g., image positioning: `{position: 'left'}`) |

### 2. **Author**
| Field | Type | Description |
|-------|------|-------------|
| `name` | Text | Author name |
| `bio` | Rich Text | Biography |
| `avatar` | Asset | Profile picture |

### 3. **TaxonomyTerm**
| Field | Type | Description |
|-------|------|-------------|
| `title` | Text | Display name |
| `slug` | Text | URL-friendly identifier |
| `type` | Text | genre \| audience \| language |
| `parent` | Reference | Hierarchical parent |

### 4. **HomePage**
| Field | Type | Description |
|-------|------|-------------|
| `title` | Text | Page title |
| `heroBanner` | Asset | Hero image |
| `imageWithTextSection` | JSON | Dynamic section data |

---

## 🔧 Migration 

Content model defined in `cms-cms-cli-scripts/content-types/` (taxonomyTerm.js, author.js, book.js, homePage.js).

**Setup:**
```bash
npm run migrate  # Create content types
npm run seed     # Populate 7 sample books
```

See [cms-cms-cli-scripts/content-types/README.md](cms-cli-scripts/content-types/README.md) for details.

---

## 🎨 Key Features Explained

### 1. **Book Listing with Filters** ([app/books/page.tsx](app/books/page.tsx))
- Server-side data fetching
- Client-side filtering by taxonomies
- Toggle between pagination and infinite scroll
- Real-time filter updates

### 2. **Book Detail Page** ([app/books/[slug]/page.tsx](app/books/[slug]/page.tsx))
- Dynamic routing based on slugs
- Rich text rendering
- Star rating display
- Related taxonomies

### 3. **Draft Mode** (Content Preview)
- Preview unpublished content
- Enabled via `/api/draft?secret=XXX&slug=book-slug`
- Disabled via `/api/disable-draft`

### 4. **On-Demand Revalidation**
- Webhook-triggered cache invalidation
- Instant updates on content changes
- See [Step 9](#step-9-try-using-on-demand-revalidation) below

### 5. **Custom Star Rating Field**
- Contentful app for rating input
- Visual star picker in CMS
- Display component for frontend

---

## ➕ How to Add a New Field to the Book Content Type

### Example: Adding a "Publication Year" Field

#### Step 1: Update Content Type Definition

Edit [cms-cli-scripts/content-types/book.js](cms-cli-scripts/content-types/book.js):

```javascript
// Add the new field to the Book content type
book.createField("publicationYear")
  .name("Publication Year")
  .type("Integer")
  .required(false)
  .validations([
    {
      range: {
        min: 1000,
        max: new Date().getFullYear() + 10
      }
    }
  ]);
```

**Run migration to apply changes:**
```bash
npm run migrate
```

This updates your Contentful space with the new field.

**Alternative**: Add manually in Contentful UI (not recommended for team projects):
1. Go to **Content model > Book**
2. Click **Add field** → **Integer**
3. Set **Field ID**: `publicationYear`, **Name**: "Publication Year"
4. Add validation: Min 1000, Max current year + 10
5. Save

> **💡 Best Practice**: Always use migrations to keep content model in sync across environments and team members.

#### Step 2: Update GraphQL Query ([lib/api.ts](lib/api.ts))

Add the new field to `BOOK_GRAPHQL_FIELDS`:

```typescript
const BOOK_GRAPHQL_FIELDS = `
  title
  shortDescription { json }
  coverImage { url }
  numberOfPages
  rating
  publicationYear  # ← Add this
  externalResourceLink
  ...
`;
```

#### Step 3: Update TypeScript Types (Optional but Recommended)

In `lib/api.ts` or create a `types.ts` file:

```typescript
export interface Book {
  title: string;
  slug: string;
  shortDescription?: any;
  coverImage?: { url: string };
  numberOfPages?: number;
  rating?: number;
  publicationYear?: number;  // ← Add this
  // ...other fields
}
```

#### Step 4: Display in UI

Update [app/books/[slug]/page.tsx](app/books/[slug]/page.tsx):

```typescript
<div className="mb-6 text-lg">
  {book.publicationYear && (
    <span className="ml-4">Published: {book.publicationYear}</span>
  )}
</div>
```

#### Step 5: Update Seed Data (Optional)

Add to `cms-cli-scripts/books.json`:

```json
{
  "title": "Example Book",
  "publicationYear": 2024,
  ...
}
```

Then reseed:
```bash
npm run seed
```

## 🚀 Deployment Branches

### Preview Deployment (Development)
Push to any branch matching `dev-*` pattern to automatically:
- ✅ Run linting checks
- 🚀 Deploy to preview environment

**Preview URL:** [https://book-contentful-cms-nextj-git-485118-pavlooliinyk-devs-projects.vercel.app/](https://book-contentful-cms-nextj-git-485118-pavlooliinyk-devs-projects.vercel.app/)

### Production Deployment
Merge to `main` branch to automatically:
- ✅ Run linting checks
- 🚀 Deploy to production environment

**Production URL:** [https://book-contentful-cms-nextjs.vercel.app/](https://book-contentful-cms-nextjs.vercel.app/)


---

## 🚀 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (localhost:3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run migrate` | **Create content types** - Run migrations to set up content model (schema) |
| `npm run seed` | **Populate data** - Create sample books from `books.json` (requires migrate first) |
| `npm run setup-app` | Install custom Contentful app dependencies |
| `npm run start-app` | Start Contentful custom app (localhost:3001) |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |

> **💡 First-time setup workflow:**
> 1. `npm run migrate` - Creates all content types (Book, Author, TaxonomyTerm, HomePage)
> 2. `npm run seed` - Populates with 7 sample books, authors, and taxonomies

---

## 🔄 Development Workflow

### Making Changes to Book Features

1. **Add/Modify Content in Contentful**
   - Go to Contentful Web App
   - Edit book entries
   - Publish changes

2. **Test with Draft Mode**
   ```
   http://localhost:3000/api/draft?secret=my_super_secret&slug=book-title-slug
   ```

3. **Update GraphQL Queries**
   - Edit `lib/api.ts`
   - Add new fields to `BOOK_GRAPHQL_FIELDS`

4. **Build New Components**
   - Create in `app/_components/`
   - Follow existing patterns (see `star-rating-display.tsx`)

5. **Test Locally**
   ```bash
   npm run dev
   ```

### Adding a New Book Page/Route

```typescript
// app/books/my-new-route/page.tsx
import { getAllBooks } from "@/lib/api";

export default async function MyBookPage() {
  const { items: books } = await getAllBooks(false, 10);
  
  return (
    <div className="container mx-auto px-5">
      <h1>My Custom Book Page</h1>
      {/* Your component logic */}
    </div>
  );
}
```

### Working with Taxonomies (Filters)

Taxonomies are used for categorization. To filter books:

```typescript
// In your component or API
const { items } = await getAllBooks(
  false,           // isDraftMode
  10,              // limit
  0,               // skip
  ['tax-id-1', 'tax-id-2']  // filter by taxonomy IDs
);
```

------

## 🚢 Deployment & Production

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fcms-contentful&project-name=nextjs-contentful-blog&repository-name=nextjs-contentful-blog&demo-title=Next.js+Blog&demo-description=Static+blog+with+multiple+authors+using+Draft+Mode&demo-url=https%3A%2F%2Fnext-blog-contentful.vercel.app%2F&demo-image=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fv1625705016%2Ffront%2Fexamples%2FCleanShot_2021-07-07_at_19.43.15_2x.png&integration-ids=oac_aZtAZpDfT1lX3zrnWy7KT9VA&env=CONTENTFUL_PREVIEW_SECRET&envDescription=Any%20URL%20friendly%20value%20to%20secure%20Draft%20Mode)

#### Manual Deployment Steps

1. **Push to Git**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - **Important**: Add all environment variables from `.env.local`

3. **Set Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all `CONTENTFUL_*` variables
   - Add `NEXT_PUBLIC_ALGOLIA_*` if using search

4. **Deploy**
   - Vercel will auto-deploy on push to main branch

---

## 🔌 Setting Up Draft Mode (Content Preview)

Allows content editors to preview unpublished changes.

### In Contentful:

1. Go to **Settings > Content preview**
2. Click **Add content preview**
3. Fill in:
   - **Name**: Development Preview
   - **Content preview URL**:
     ```
     http://localhost:3000/api/draft?secret=my_super_secret&slug={entry.fields.slug}
     ```
     (Replace with your production URL for production)

4. Check **Book** content type
5. Save

### Usage:

1. Edit a book entry
2. Make changes (don't publish)
3. Click **Open preview** in sidebar
4. See unpublished changes live!

Exit draft mode: Navigate to `/api/disable-draft`

---

## 🔄 Setting Up On-Demand Revalidation (Webhooks)

Enables instant cache updates when content changes.

### In Contentful:

1. Go to **Settings > Webhooks**
2. Click **Add webhook**
3. Configure:
   - **Name**: Vercel Revalidation
   - **URL**: `https://your-site.vercel.app/api/revalidate`
   - **Triggers**: Select "Publish" and "Unpublish" for Entries and Assets
   - **Secret header**: 
     - Key: `x-vercel-reval-key`
     - Value: `my_super_secret` (your `CONTENTFUL_REVALIDATE_SECRET`)
   - **Content type**: `application/json`

4. Save and activate

### Test:

1. Edit and publish a book in Contentful
2. Visit your site - changes appear instantly!
3. Check webhook logs in Contentful for 200 status

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. "GraphQL Errors: TOO_COMPLEX_QUERY"
**Problem**: Querying too many books at once

**Solution**: Reduce the `limit` in `getAllBooks()` calls
```typescript
const { items } = await getAllBooks(false, 20); // Instead of 100
```

#### 2. Books Not Showing
**Checklist**:
- ✅ Content published in Contentful?
- ✅ Environment variables correct?
- ✅ `npm run setup` executed?
- ✅ GraphQL query includes all fields?

**Debug**:
```typescript
// In lib/api.ts, add logging
const result = await fetchGraphQL(query, preview);
console.log('GraphQL Result:', JSON.stringify(result, null, 2));
```

#### 3. Draft Mode Issues
- Ensure `CONTENTFUL_PREVIEW_SECRET` matches in code and Contentful URL
- Check preview token vs. delivery token
- Verify `draftMode()` is awaited: `const { isEnabled } = await draftMode();`

#### 4. Images Not Loading
- Check asset is published in Contentful
- Verify `coverImage` field in GraphQL query includes `url`
- Check Next.js `next.config.js` has Contentful domain in `images.remotePatterns`

#### 5. TypeScript Errors After Adding Field
- Update TypeScript interfaces
- Restart TS server: `Cmd/Ctrl + Shift + P` → "Restart TS Server"

---

## 📚 Best Practices for Book Features

### 1. **Always Use Type Safety**
```typescript
// Good ✅
interface Book {
  title: string;
  rating?: number;
}

// Avoid ❌
const book: any = ...;
```

### 2. **Handle Missing Data Defensively**
```typescript
// Good ✅
{book.authors?.map((a) => a.name).join(", ") || "Unknown Author"}

// Risky ❌
{book.authors.map((a) => a.name).join(", ")}
```

### 3. **Filter Falsy Values**
```typescript
const taxonomies = book.taxonomiesCollection?.items.filter(Boolean) || [];
```

### 4. **Use Contentful's Reference Pattern**
```graphql
authorsCollection(limit: 10) {
  items {
    name
    bio { json }
  }
}
```

### 5. **Optimize GraphQL Queries**
- Only request fields you need
- Limit nested collections
- Use fragments for reusable fields

### 6. **Leverage Next.js 15 Features**
```typescript
// Async params/searchParams
const { slug } = await params;
const { isEnabled } = await draftMode();

// Cache tags for revalidation
fetch(..., { next: { tags: ['books'] } })
```

---

## 🎓 Learning Resources

### Next.js 15 Specifics
- **Async Params**: `const { slug } = await params;`
- **Async Headers**: `const { isEnabled } = await draftMode();`
- [Next.js Docs](https://nextjs.org/docs)

### Contentful
- [GraphQL API Docs](https://www.contentful.com/developers/docs/references/graphql/)
- [Content Management API](https://www.contentful.com/developers/docs/references/content-management-api/)
- [Rich Text Rendering](https://www.contentful.com/developers/docs/tutorials/general/rich-text-and-react/)

### This Codebase
- Check [CONTENTFUL-APP-GUIDE.md](./CONTENTFUL-APP-GUIDE.md) for custom app development
- Review [app/_components/book-list](app/_components/book-list) for client-side patterns
- See [lib/api.ts](lib/api.ts) for all available API functions

---

## 📝 Advanced: Creating a Custom Contentful Field

Example: Creating a "Series Selector" field

1. **Create Component**
   ```typescript
   // contentful-custom-app/src/locations/SeriesField.tsx
   import { FieldAppSDK } from '@contentful/app-sdk';
   
   const SeriesField = ({ sdk }: { sdk: FieldAppSDK }) => {
     const [value, setValue] = useState(sdk.field.getValue());
     
     return <select onChange={(e) => setValue(e.target.value)}>
       {/* Your options */}
     </select>;
   };
   ```

2. **Register in Contentful**
   - Apps → Your App → Locations
   - Enable "Entry field"
   - Select field types: "Short text", "JSON", etc.

3. **Assign to Content Type**
   - Content model → Book → Your field
   - Appearance → Select your app

---

## 🤝 Contributing

### Adding a New Book Source

1. Create seeder function in `cms-cli-scripts/`
2. Update `books.json` schema
3. Modify `seed-books.js` to handle new structure
4. Document in README

### Code Style

- Use TypeScript for all new files
- Follow existing component patterns
- Add JSDoc comments for complex functions
- Run `npm run lint:fix` before committing

---

## 🔗 Related Documentation

- [CONTENTFUL-APP-GUIDE.md](./CONTENTFUL-APP-GUIDE.md) - Custom app development
- [VERCEL-TROUBLESHOOTING.md](./VERCEL-TROUBLESHOOTING.md) - Deployment issues

---

## 📞 Getting Help

- **Next.js Issues**: [GitHub Discussions](https://github.com/vercel/next.js/discussions)
- **Contentful Issues**: [Community Forum](https://www.contentful.com/developers/community/)
- **Project Issues**: Open an issue in this repository

---

## 📖 Setup Guide 

### Related examples

```
http://localhost:3000/api/draft?secret=<CONTENTFUL_PREVIEW_SECRET>&slug={entry.fields.slug}
```

Replace `<CONTENTFUL_PREVIEW_SECRET>` with its respective value in `.env.local`.

![Content preview setup](https://github.com/vercel/next.js/assets/9113740/f1383d68-ea2b-4adf-974f-235b8c098745)

Once saved, go to one of the posts you've created and:

- **Update the title**. For example, you can add `[Draft]` in front of the title.
- The state of the post will switch to **CHANGED** automatically. **Do not** publish it. By doing this, the post will be in draft state.
- In the sidebar, you will see the **Open preview** button. Click on it!

![Content entry overview](https://github.com/vercel/next.js/assets/9113740/cc0dff9a-c57e-4ec4-85f1-22ab74af2b6b)

You will now be able to see the updated title. To manually exit Draft Mode, you can navigate to `/api/disable-draft` in the browser.

### Step 8. Deploy on Vercel

You can deploy this app to the cloud with [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

#### Deploy Your Local Project

To deploy your local project to Vercel, push it to GitHub/GitLab/Bitbucket and [import to Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example).

**Important**: When you import your project on Vercel, make sure to click on **Environment Variables** and set them to match your `.env.local` file.

#### Deploy from Our Template

Alternatively, you can deploy using our template by clicking on the Deploy button below.

This will deploy the Next.js project as well as connect it to your Contentful space using the Vercel Contentful Integration. If you are using Draft Mode, make sure to add `CONTENTFUL_PREVIEW_SECRET` as an [Environment Variable](https://vercel.com/docs/concepts/projects/environment-variables) as well.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fcms-contentful&project-name=nextjs-contentful-blog&repository-name=nextjs-contentful-blog&demo-title=Next.js+Blog&demo-description=Static+blog+with+multiple+authors+using+Draft+Mode&demo-url=https%3A%2F%2Fnext-blog-contentful.vercel.app%2F&demo-image=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fv1625705016%2Ffront%2Fexamples%2FCleanShot_2021-07-07_at_19.43.15_2x.png&integration-ids=oac_aZtAZpDfT1lX3zrnWy7KT9VA&env=CONTENTFUL_PREVIEW_SECRET,CONTENTFUL_REVALIDATE_SECRET&envDescription=Any%20URL%20friendly%20value%20to%20secure%20Your%20App)

You need to add these secrets in your GitHub repository (Settings → Secrets and variables → Actions):

VERCEL_TOKEN - Generate from Vercel dashboard → Settings → Tokens
VERCEL_ORG_ID - team_kKlsiY3KUFZsQdhKo1JOfH4v Found in .vercel/project.json after running vercel link locally (optional, as vercel pull handles this)
VERCEL_PROJECT_ID - prj_Gigxmgt1gWWEuN42jAJzA2I4lYNe Same as above (optional)

how to :
https://vercel.com/kb/guide/how-do-i-use-a-vercel-api-access-token
https://codenote.net/en/posts/how-to-find-vercel-org-project-ids/

### Step 9. Try using On-Demand Revalidation

In your Contentful space, go to **Settings > Webhooks** and add a new webhook:

- **Give the webhook a name**
- **Activate:** Check the activate checkbox to ensure the webhook is marked as active
- **Specify the POST URL:** Using the URL from your Vercel deployment in step 8, add the path `/api/revalidate` at the end, so it would look something like:

  ```
  https://<YOUR_VERCEL_DEPLOYMENT_URL>/api/revalidate
  ```

  Replace `<YOUR_VERCEL_DEPLOYMENT_URL>` with your own deployment URL as noted in the Vercel dashboard.

- **Specify Triggers:** You can choose to trigger for all events or specific events only, such as the Publishing and Unpublishing of Entries and Assets, as shown below.

  ![Content webhook url](https://github.com/vercel/next.js/assets/9113740/c8df492a-57d6-42a1-8a3c-b0de3d6ad42f)

- **Specify Secret Header:** Add a secret header named `x-vercel-reval-key` and enter the value of the
  `CONTENTFUL_REVALIDATE_SECRET` from before.

  ![Content secret header](https://github.com/vercel/next.js/assets/9113740/574935e6-0d31-4e4f-b914-8b01bdf03d5e)

- **Set Content type:** Set content type to `application/json` in the dropdown.

  ![Content publish changes](https://github.com/vercel/next.js/assets/9113740/78bd856c-ece1-4bf3-a330-1d544abd858d)

- **Edit post:** Now, try editing the title of one of your blog posts in Contentful and click Publish. You should see the changed reflected in the website you just deployed, all without triggering a build! Behind the scenes a call was made to the revalidate api that triggers a revalidation of both the landing page and the specific post that was changed.

  ![Content publish changes](https://github.com/vercel/next.js/assets/9113740/ad96bfa7-89c1-4e46-9d9c-9067176c9769)

- **Verify:** You can verify if your request was made successfully by checking the webhook request log on Contentful and checking for a successful 200 status code, or by having your functions tab open on Vercel when committing the change (log drains may also be used). If you are experiencing issues with the api call, ensure you have correctly entered in the value for environment variable `CONTENTFUL_REVALIDATE_SECRET` within your Vercel deployment.

  ![Content successful request](https://github.com/vercel/next.js/assets/9113740/ed1ffbe9-4dbf-4ec6-9c1f-39c8949c4d38)

---

