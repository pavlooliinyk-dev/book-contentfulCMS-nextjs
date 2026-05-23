## Plan: Add NextAuth.js + Stripe Payment with Embedded Forms

Add complete authentication and payment processing to enable user accounts and book purchases. Currently the app displays pricing but has no user system or checkout. This adds NextAuth.js (GitHub OAuth), Stripe Payment Intents with embedded forms, webhook handling, and user-specific order management following Next.js 15 App Router patterns.

**Recommended Approach:**
- **Phase 0:** Add NextAuth.js with GitHub OAuth for user authentication
- Use **Stripe Elements** (embedded payment forms) for seamless on-page checkout
- Add server-side API routes for auth, Payment Intent creation, and confirmation
- Create client-side components with Stripe Elements following existing patterns
- Use middleware.ts for CSP headers for Stripe domains
- Store orders in JSON files with userId tracking
- Add TypeScript types for User, Session, and Stripe entities

---

**Steps**

### Phase 0: Authentication with NextAuth.js (*execute first* - **Reusable Module**)
1. Add `next-auth` package to [package.json](package.json)
2. Add environment variables to `.env.local` and update `.env.example`:
   - `NEXTAUTH_URL=http://localhost:3000`
   - `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
   - `GITHUB_ID` (from GitHub OAuth App)
   - `GITHUB_SECRET` (from GitHub OAuth App)
3. Create GitHub OAuth App:
   - GitHub Settings > Developer settings > OAuth Apps > New OAuth App
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and Secret to `.env.local`
4. **Create reusable auth module structure:**
   - [lib/auth/config.ts](lib/auth/config.ts) — NextAuth `authOptions` configuration with GitHub provider
   - [lib/auth/session.ts](lib/auth/session.ts) — server-side session helpers: `getServerSession()`, `requireAuth()`, `getCurrentUser()`
   - [lib/auth/types.ts](lib/auth/types.ts) — User interface, extend next-auth module declarations
   - [lib/auth/index.ts](lib/auth/index.ts) — barrel export for easy imports
5. Create [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts) — import `authOptions` from lib/auth, export GET/POST handlers
6. **Create reusable auth components:**
   - [app/_components/auth/auth-button.tsx](app/_components/auth/auth-button.tsx) — "Sign in with GitHub" / "Sign out" button with avatar
   - [app/_components/auth/session-provider.tsx](app/_components/auth/session-provider.tsx) — wrapper for NextAuth SessionProvider
   - [app/_components/auth/require-auth.tsx](app/_components/auth/require-auth.tsx) — client component that redirects if not authenticated
   - [app/_components/auth/index.ts](app/_components/auth/index.ts) — barrel export
7. Update [app/_components/main-navigation.tsx](app/_components/main-navigation.tsx) — add `<AuthButton>` from auth module
8. Wrap [app/layout.tsx](app/layout.tsx) with `<AuthSessionProvider>` from auth module

### Phase 1: Dependencies & Environment Setup (*depends on Phase 0*)
10. Add Stripe packages: `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`
11. Create [middleware.ts](middleware.ts) in project root — add CSP headers for Stripe domains (`js.stripe.com`, `*.stripe.com`, `*.stripe.network`) using NextResponse
12. Add Stripe env vars: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
13. Update [lib/types.ts](lib/types.ts) — add `Order` (with userId, userEmail), `PaymentStatus`, `PaymentIntentResponse`

### Phase 2: Server-Side Configuration (*depends on step 13*)
14. Create [lib/stripe.ts](lib/stripe.ts) — initialize Stripe SDK
15. Create [lib/stripe-helpers.ts](lib/stripe-helpers.ts) — `formatAmountForStripe()`, `createPaymentIntent(bookId, price, userId, userEmail)`

### Phase 3: API Routes for Payments (*depends on steps 14-15, requires auth*)
16. Create [app/api/stripe/create-payment-intent/route.ts](app/api/stripe/create-payment-intent/route.ts) — **require auth** using `requireAuth()` from lib/auth, create Payment Intent with user metadata
17. Create [app/api/stripe/confirm-payment/route.ts](app/api/stripe/confirm-payment/route.ts) — **require auth** using `requireAuth()`, verify ownership, save order with userId
18. Create [app/api/stripe/webhooks/route.ts](app/api/stripe/webhooks/route.ts) — verify signature, handle `payment_intent.succeeded`
19. Create [app/api/orders/route.ts](app/api/orders/route.ts) — **require auth** using `requireAuth()`, return user's orders only

### Phase 4: Client-Side Components (*depends on step 10, requires auth*)
20. Create [app/_components/stripe-elements-provider.tsx](app/_components/stripe-elements-provider.tsx) — load Stripe.js, provide Elements context
21. Create [app/_components/payment-form.tsx](app/_components/payment-form.tsx) — check `useSession()`, create Payment Intent, render `<PaymentElement>`, handle submit
22. Create [app/_components/checkout-modal.tsx](app/_components/checkout-modal.tsx) — modal wrapper with backdrop
23. Create [app/_components/purchase-button.tsx](app/_components/purchase-button.tsx) — check auth, show "Sign in to purchase" if not authenticated
24. Update [app/books/[slug]/page.tsx](app/books/[slug]/page.tsx) — add `<PurchaseButton>`

### Phase 5: Order Management (*parallel with Phase 4, requires auth*)
25. Create [app/orders/page.tsx](app/orders/page.tsx) — use `<RequireAuth>` component from lib/auth or server-side `getServerSession()`, fetch user's orders, display with status badges
26. Update [app/_components/main-navigation.tsx](app/_components/main-navigation.tsx) — add "My Orders" link (conditional)

### Phase 6: Data & Testing
27. Create [data/orders.json](data/orders.json) — empty array
28. Test auth: sign in with GitHub, verify avatar
29. Test checkout: while signed in, purchase book, verify order in JSON with userId
30. Test protected routes: sign out, try `/orders`, verify redirect
31. Test webhooks: use Stripe CLI

---

## **DETAILED SPECIFICATIONS BY PHASE**

---

## **Phase 0: Authentication with NextAuth.js - Detailed Specs**

### **Step 1: Install next-auth package**

**Requirements:**
- Add `next-auth` to dependencies in package.json
- Version: Latest compatible with Next.js 15 (typically ^5.x)

**Acceptance Criteria:**
- Package appears in `package.json` dependencies
- `npm install` runs without errors
- TypeScript types are available from `next-auth`

---

### **Step 2: Environment Variables Setup**

**Requirements:**
- Create `.env.local` with NextAuth and GitHub OAuth variables
- Update `.env.example` with placeholder values

**Environment Variables Specification:**
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret-32-chars>

# GitHub OAuth
GITHUB_ID=<your-github-oauth-app-client-id>
GITHUB_SECRET=<your-github-oauth-app-client-secret>
```

**Generation Commands:**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

**Acceptance Criteria:**
- `.env.local` exists with all 4 variables
- `.env.example` exists with placeholder comments
- Secret is 32+ characters, base64 encoded
- URL matches development environment

---

### **Step 3: GitHub OAuth App Creation**

**Requirements:**
- Create OAuth App in GitHub Developer Settings
- Configure callback URL for NextAuth
- Obtain Client ID and Client Secret

**Configuration Specification:**
- **Application name:** `[Your App Name] - Development`
- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
- **Enable Device Flow:** No (optional)

**Acceptance Criteria:**
- OAuth App appears in GitHub Developer Settings
- Client ID and Secret copied to `.env.local`
- Callback URL matches exactly (no trailing slash)
- Production app created separately with production URLs

---

### **Step 4: Auth Module - lib/auth/config.ts**

**File:** `lib/auth/config.ts`

**Requirements:**
- Export `authOptions` object compatible with NextAuth
- Configure GitHub provider
- Add session callback to include userId in JWT
- Handle error cases

**Type Signature:**
```typescript
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions
```

**Configuration Specification:**
```typescript
{
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Add userId to session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',  // Redirect to home for sign-in
    error: '/',    // Redirect to home on error
  },
  session: {
    strategy: 'jwt',  // Use JWT sessions (no database)
  },
}
```

**Acceptance Criteria:**
- Exports `authOptions` object
- GitHub provider configured with env vars
- Session callback adds userId
- No TypeScript errors
- Error handling for missing env vars

---

### **Step 4: Auth Module - lib/auth/session.ts**

**File:** `lib/auth/session.ts`

**Requirements:**
- Export server-side session helper functions
- Handle authentication checks
- Provide type-safe user access

**Function Specifications:**

**1. `getServerSession()`**
```typescript
import { getServerSession as nextAuthGetServerSession } from 'next-auth/next';
import { authOptions } from './config';

export async function getServerSession() {
  return await nextAuthGetServerSession(authOptions);
}
```
- **Returns:** Session object or null
- **Use case:** Server components, API routes
- **Side effects:** None

**2. `requireAuth()`**
```typescript
export async function requireAuth() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return session.user;
}
```
- **Returns:** User object (never null)
- **Throws:** 401 Response if not authenticated
- **Use case:** Protected API routes
- **Side effects:** Terminates request if unauthorized

**3. `getCurrentUser()`**
```typescript
export async function getCurrentUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}
```
- **Returns:** User object or null
- **Use case:** Optional auth checks in server components
- **Side effects:** None

**Acceptance Criteria:**
- All functions exported and typed
- `requireAuth()` throws 401 for unauthenticated
- Functions work in API routes and server components
- No client-side usage (server-only)

---

### **Step 4: Auth Module - lib/auth/types.ts**

**File:** `lib/auth/types.ts`

**Requirements:**
- Define User interface
- Extend NextAuth module declarations for custom session data

**Type Specifications:**

```typescript
import { DefaultSession } from 'next-auth';

// User interface
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: User & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
  }
}
```

**Acceptance Criteria:**
- User interface matches NextAuth defaults + id
- Module declarations extend NextAuth types
- TypeScript recognizes `session.user.id`
- No type errors in editor

---

### **Step 4: Auth Module - lib/auth/index.ts**

**File:** `lib/auth/index.ts`

**Requirements:**
- Barrel export for clean imports

**Specification:**
```typescript
export { authOptions } from './config';
export { getServerSession, requireAuth, getCurrentUser } from './session';
export type { User } from './types';
```

**Acceptance Criteria:**
- Single import point: `import { requireAuth } from '@/lib/auth'`
- All exports available
- No circular dependencies

---

### **Step 5: NextAuth API Route**

**File:** `app/api/auth/[...nextauth]/route.ts`

**Requirements:**
- Create catch-all route for NextAuth
- Export GET and POST handlers
- Import authOptions from lib/auth

**Implementation Specification:**
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

**Route Behavior:**
- `GET /api/auth/signin` → Sign-in page
- `GET /api/auth/signout` → Sign-out page
- `GET /api/auth/callback/github` → GitHub OAuth callback
- `GET /api/auth/session` → Get current session
- `POST /api/auth/signin/github` → Initiate GitHub sign-in

**Acceptance Criteria:**
- File in correct location with correct name
- GET and POST exports present
- Routes respond correctly
- Session endpoint returns user data when authenticated

---

### **Step 6: Auth Components - auth-button.tsx**

**File:** `app/_components/auth/auth-button.tsx`

**Requirements:**
- Client component using NextAuth hooks
- Display "Sign in with GitHub" when logged out
- Display user avatar and "Sign out" when logged in
- Handle loading states

**Component Specification:**

**Props:** None

**State:**
- Uses `useSession()` hook from next-auth/react

**Behavior:**
- Loading: Show skeleton or spinner
- Unauthenticated: Show "Sign in with GitHub" button
- Authenticated: Show user avatar + name + "Sign out" button

**UI Requirements:**
```tsx
// Signed out state
<button onClick={() => signIn('github')}>
  <GitHubIcon /> Sign in with GitHub
</button>

// Signed in state
<div>
  <img src={user.image} alt={user.name} />
  <span>{user.name}</span>
  <button onClick={() => signOut()}>Sign out</button>
</div>
```

**Styling:**
- Use existing Tailwind patterns from navigation
- Avatar: rounded-full, w-8 h-8
- Button: match existing button styles

**Acceptance Criteria:**
- Shows correct UI based on auth state
- Sign in initiates GitHub OAuth flow
- Sign out clears session and redirects
- Avatar displays correctly
- Loading state prevents flash

---

### **Step 6: Auth Components - session-provider.tsx**

**File:** `app/_components/auth/session-provider.tsx`

**Requirements:**
- Wrapper component for NextAuth SessionProvider
- Client component
- Accept children and optional session prop

**Component Specification:**

```typescript
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { ReactNode } from 'react';

interface AuthSessionProviderProps {
  children: ReactNode;
  session?: Session | null;
}

export function AuthSessionProvider({ children, session }: AuthSessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
```

**Acceptance Criteria:**
- Wraps NextAuth SessionProvider
- Properly typed props
- Works in app layout
- Session available to all child components

---

### **Step 6: Auth Components - require-auth.tsx**

**File:** `app/_components/auth/require-auth.tsx`

**Requirements:**
- Client component that guards protected content
- Redirect to home if not authenticated
- Show loading state during auth check

**Component Specification:**

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
```

**Acceptance Criteria:**
- Redirects unauthenticated users
- Shows loading state appropriately
- Renders children only when authenticated
- No flash of protected content

---

### **Step 6: Auth Components - index.ts**

**File:** `app/_components/auth/index.ts`

**Specification:**
```typescript
export { AuthButton } from './auth-button';
export { AuthSessionProvider } from './session-provider';
export { RequireAuth } from './require-auth';
```

---

### **Step 7: Update main-navigation.tsx**

**File:** `app/_components/main-navigation.tsx`

**Requirements:**
- Import and add AuthButton component
- Position in navigation (typically top-right)

**Implementation:**
```tsx
import { AuthButton } from '@/app/_components/auth';

export default function MainNavigation() {
  return (
    <nav>
      {/* existing nav items */}
      <AuthButton />
    </nav>
  );
}
```

**Acceptance Criteria:**
- AuthButton visible in navigation
- Responsive design maintained
- No layout shift

---

### **Step 8: Update app/layout.tsx**

**File:** `app/layout.tsx`

**Requirements:**
- Wrap application with AuthSessionProvider
- Maintain existing layout structure

**Implementation:**
```tsx
import { AuthSessionProvider } from '@/app/_components/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthSessionProvider>
          {/* existing layout content */}
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
```

**Acceptance Criteria:**
- Session accessible in all components
- No hydration errors
- Existing layout unchanged visually

---

## **Phase 1: Dependencies & Environment Setup - Detailed Specs**

### **Step 10: Install Stripe Packages**

**Requirements:**
- Add Stripe SDK (server-side)
- Add Stripe.js loader (client-side)
- Add Stripe React components

**Package Specifications:**
```json
{
  "dependencies": {
    "stripe": "^17.5.0",
    "@stripe/stripe-js": "^4.10.0",
    "@stripe/react-stripe-js": "^3.1.0"
  }
}
```

**Acceptance Criteria:**
- All three packages installed
- Compatible versions (check Stripe docs for compatibility matrix)
- TypeScript types available
- No peer dependency warnings

---

### **Step 11: Create middleware.ts**

**File:** `middleware.ts` (project root)

**Requirements:**
- Add Content Security Policy headers for Stripe domains
- Apply to all routes
- Use NextResponse API

**Implementation Specification:**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy for Stripe
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "connect-src 'self' https://api.stripe.com https://*.stripe.com https://*.stripe.network",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: '/:path*',
};
```

**CSP Breakdown:**
- `js.stripe.com` — Stripe.js library
- `api.stripe.com` — API calls
- `*.stripe.com` — Additional Stripe services
- `*.stripe.network` — Fraud detection
- `hooks.stripe.com` — Stripe Elements iframes

**Acceptance Criteria:**
- Middleware file in project root
- CSP header set on all routes
- No console CSP violations when loading Stripe
- Existing app functionality unaffected

---

### **Step 12: Stripe Environment Variables**

**Requirements:**
- Add Stripe API keys to `.env.local`
- Update `.env.example`
- Document key acquisition

**Environment Variables Specification:**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...    # Server-side key (never expose)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Client-side key
STRIPE_WEBHOOK_SECRET=whsec_...  # For webhook signature verification
```

**Key Acquisition:**
1. Visit [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API keys
3. Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Click "Reveal test key" → Copy "Secret key" → `STRIPE_SECRET_KEY`
5. Navigate to Developers > Webhooks > Add endpoint
6. Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

**Security Requirements:**
- Use test keys for development
- Never commit `.env.local`
- Rotate keys if exposed
- Use restricted keys in production

**Acceptance Criteria:**
- All 3 env vars present in `.env.local`
- `.env.example` updated with comments
- Keys are test mode (prefix: `sk_test_`, `pk_test_`)
- Server starts without env var errors

---

### **Step 13: Update lib/types.ts - Stripe Types**

**File:** `lib/types.ts`

**Requirements:**
- Add Order interface
- Add PaymentStatus enum
- Add PaymentIntentResponse interface
- Ensure type safety for Stripe integration

**Type Specifications:**

```typescript
// Payment Status Enum
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

// Order Interface
export interface Order {
  orderId: string;                    // Unique order ID (UUID or timestamp-based)
  bookId: string;                     // Book slug/ID from CMS
  bookTitle?: string;                 // Optional: book title for display
  bookSlug?: string;                  // Optional: book slug for linking
  userId: string;                     // User ID from NextAuth session
  userEmail: string;                  // User email from session
  price: number;                      // Price in dollars (e.g., 19.99)
  currency: string;                   // Currency code (default: 'usd')
  status: PaymentStatus;              // Payment status
  paymentIntentId: string;            // Stripe Payment Intent ID
  createdAt: string;                  // ISO timestamp
  updatedAt: string;                  // ISO timestamp
}

// Payment Intent Response (from API)
export interface PaymentIntentResponse {
  clientSecret: string;               // For Stripe Elements
  amount: number;                     // Amount in cents
  currency: string;                   // Currency code
}

// Create Order Input
export interface CreateOrderInput {
  bookId: string;
  quantity?: number;                  // Default: 1
}
```

**Acceptance Criteria:**
- All types exported
- Compatible with Stripe SDK types
- Used consistently across codebase
- No TypeScript errors

---

## **Phase 2: Server-Side Configuration - Detailed Specs**

### **Step 14: Create lib/stripe.ts**

**File:** `lib/stripe.ts`

**Requirements:**
- Initialize Stripe SDK with secret key
- Export configured Stripe instance
- Error handling for missing API key
- Server-side only (no client exposure)

**Implementation Specification:**

```typescript
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',  // Use latest API version
  typescript: true,                  // Enable TypeScript support
  appInfo: {
    name: 'Next.js Book Store',
    version: '1.0.0',
  },
});
```

**Configuration Options:**
- `apiVersion`: Use latest stable version
- `typescript`: Enable for better type inference
- `appInfo`: Helps Stripe identify your integration

**Acceptance Criteria:**
- Stripe instance exported
- Uses env var for secret key
- Throws error if key missing
- Import works: `import { stripe } from '@/lib/stripe'`
- No client-side bundle (server-only module)

---

### **Step 15: Create lib/stripe-helpers.ts**

**File:** `lib/stripe-helpers.ts`

**Requirements:**
- Helper functions for common Stripe operations
- Amount formatting (dollars ⟷ cents)
- Payment Intent creation wrapper
- Type-safe, testable functions

**Function Specifications:**

**1. `formatAmountForStripe(amount: number): number`**
```typescript
/**
 * Convert dollar amount to cents for Stripe
 * @param amount - Amount in dollars (e.g., 19.99)
 * @returns Amount in cents (e.g., 1999)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}
```
- **Input:** 19.99
- **Output:** 1999
- **Edge cases:** Handles decimal precision correctly

**2. `formatAmountFromStripe(amount: number): number`**
```typescript
/**
 * Convert cents to dollar amount
 * @param amount - Amount in cents (e.g., 1999)
 * @returns Amount in dollars (e.g., 19.99)
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}
```
- **Input:** 1999
- **Output:** 19.99

**3. `createPaymentIntent(...)`**
```typescript
import { stripe } from './stripe';

interface CreatePaymentIntentParams {
  amount: number;           // In dollars
  currency?: string;        // Default: 'usd'
  bookId: string;
  bookTitle?: string;
  bookSlug?: string;
  userId: string;
  userEmail: string;
}

/**
 * Create a Stripe Payment Intent
 * @returns Payment Intent with client secret
 */
export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  const {
    amount,
    currency = 'usd',
    bookId,
    bookTitle,
    bookSlug,
    userId,
    userEmail,
  } = params;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: formatAmountForStripe(amount),
    currency,
    metadata: {
      bookId,
      bookTitle: bookTitle || bookId,
      bookSlug: bookSlug || bookId,
      userId,
      userEmail,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}
```

**Metadata Purpose:**
- Stored with Payment Intent
- Retrieved in webhooks
- Used for order creation
- Helps with refunds/support

**Acceptance Criteria:**
- All functions exported and typed
- Amount conversion accurate
- Payment Intent creation succeeds with test key
- Metadata stored correctly
- No rounding errors

---

## **Phase 3: API Routes for Payments - Detailed Specs**

### **Step 16: create-payment-intent Route**

**File:** `app/api/stripe/create-payment-intent/route.ts`

**Method:** POST

**Request Body:**
```typescript
{
  bookId: string;
  quantity?: number;  // Default: 1
}
```

**Response:**
```typescript
// Success (200)
{
  clientSecret: string;
  amount: number;  // In cents
}

// Error (400)
{
  error: string;
}

// Error (401)
{
  error: "Unauthorized"
}

// Error (500)
{
  error: string;
}
```

**Implementation Specification:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createPaymentIntent } from '@/lib/stripe-helpers';
import pricingData from '@/data/pricing-data.json';

export async function POST(req: NextRequest) {
  try {
    // 1. Require authentication
    const user = await requireAuth();

    // 2. Parse request body
    const body = await req.json();
    const { bookId, quantity = 1 } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: 'bookId is required' },
        { status: 400 }
      );
    }

    // 3. Get pricing data
    const pricingItem = pricingData.find((item) => item.bookId === bookId);
    const price = pricingItem?.price || 10.99;  // Fallback price
    const availability = pricingItem?.availability || 'in stock';

    // 4. Validate availability
    if (availability === 'out of stock') {
      return NextResponse.json(
        { error: 'Book is out of stock' },
        { status: 400 }
      );
    }

    // 5. Create Payment Intent
    const { clientSecret, paymentIntentId } = await createPaymentIntent({
      amount: price * quantity,
      bookId,
      userId: user.id,
      userEmail: user.email!,
    });

    // 6. Return client secret
    return NextResponse.json({
      clientSecret,
      amount: Math.round(price * quantity * 100),  // In cents
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    
    // Handle authentication error
    if (error instanceof Response && error.status === 401) {
      return error;
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
```

**Business Logic:**
1. Authenticate user (401 if not logged in)
2. Validate request body
3. Fetch pricing from JSON file
4. Check availability
5. Create Stripe Payment Intent
6. Return client secret for Elements

**Acceptance Criteria:**
- Returns 401 if not authenticated
- Returns 400 for invalid input
- Returns 400 for out of stock items
- Creates Payment Intent successfully
- Returns valid client secret
- Stores user metadata in Payment Intent
- Handles errors gracefully

---

### **Step 17: confirm-payment Route**

**File:** `app/api/stripe/confirm-payment/route.ts`

**Method:** POST

**Request Body:**
```typescript
{
  paymentIntentId: string;
}
```

**Response:**
```typescript
// Success (200)
{
  orderId: string;
  status: 'succeeded' | 'pending';
}

// Error (400/401/500)
{
  error: string;
}
```

**Implementation Specification:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { Order } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    // 1. Require authentication
    const user = await requireAuth();

    // 2. Parse request body
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'paymentIntentId is required' },
        { status: 400 }
      );
    }

    // 3. Retrieve Payment Intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 4. Verify ownership
    if (paymentIntent.metadata.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // 5. Check payment status
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({
        orderId: paymentIntentId,
        status: paymentIntent.status,
      });
    }

    // 6. Create order object
    const order: Order = {
      orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookId: paymentIntent.metadata.bookId,
      bookTitle: paymentIntent.metadata.bookTitle,
      bookSlug: paymentIntent.metadata.bookSlug,
      userId: user.id,
      userEmail: user.email!,
      price: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'succeeded',
      paymentIntentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 7. Save order to orders.json
    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    const ordersData = await fs.readFile(ordersPath, 'utf-8');
    const orders: Order[] = JSON.parse(ordersData);
    orders.push(order);
    await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));

    // 8. Return success
    return NextResponse.json({
      orderId: order.orderId,
      status: 'succeeded',
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
```

**Business Logic:**
1. Authenticate user
2. Retrieve Payment Intent from Stripe
3. Verify user owns this Payment Intent
4. Check payment status
5. Create order record
6. Append to orders.json
7. Return order confirmation

**Acceptance Criteria:**
- Requires authentication
- Verifies Payment Intent ownership
- Only creates order for succeeded payments
- Generates unique order ID
- Saves to orders.json
- Returns order ID
- Handles file system errors

---

### **Step 18: webhooks Route**

**File:** `app/api/stripe/webhooks/route.ts`

**Method:** POST

**Purpose:** Handle Stripe webhook events for async payment updates

**Implementation Specification:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { Order } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

// Disable Next.js body parsing (Stripe needs raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  try {
    // 1. Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // 2. Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        
        // Update order status in orders.json
        const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
        const ordersData = await fs.readFile(ordersPath, 'utf-8');
        const orders: Order[] = JSON.parse(ordersData);
        
        const orderIndex = orders.findIndex(
          (o) => o.paymentIntentId === paymentIntent.id
        );
        
        if (orderIndex !== -1) {
          orders[orderIndex].status = 'succeeded';
          orders[orderIndex].updatedAt = new Date().toISOString();
          await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2));
        }
        
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error(`Payment failed: ${paymentIntent.id}`);
        // TODO: Update order status to 'failed'
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // 3. Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
```

**Webhook Events Handled:**
- `payment_intent.succeeded` — Update order status
- `payment_intent.payment_failed` — Log failure

**Security:**
- Signature verification required
- Uses `STRIPE_WEBHOOK_SECRET`
- Rejects unsigned requests

**Acceptance Criteria:**
- Verifies webhook signature
- Handles payment_intent.succeeded
- Updates order status in JSON
- Returns 200 for valid webhooks
- Returns 400 for invalid signatures
- Logs unhandled events

---

### **Step 19: orders Route**

**File:** `app/api/orders/route.ts`

**Method:** GET

**Query Parameters:**
```typescript
?status=succeeded  // Optional filter
```

**Response:**
```typescript
// Success (200)
{
  orders: Order[];
}

// Error (401)
{
  error: "Unauthorized"
}
```

**Implementation Specification:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { Order } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // 1. Require authentication
    const user = await requireAuth();

    // 2. Read orders.json
    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    const ordersData = await fs.readFile(ordersPath, 'utf-8');
    const allOrders: Order[] = JSON.parse(ordersData);

    // 3. Filter by userId
    let userOrders = allOrders.filter((order) => order.userId === user.id);

    // 4. Optional status filter
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    
    if (statusFilter) {
      userOrders = userOrders.filter((order) => order.status === statusFilter);
    }

    // 5. Sort by date (newest first)
    userOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // 6. Return orders
    return NextResponse.json({ orders: userOrders });

  } catch (error) {
    console.error('Get orders error:', error);
    
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
```

**Business Logic:**
1. Authenticate user
2. Read all orders from JSON
3. Filter by current user's ID
4. Optionally filter by status
5. Sort by date (newest first)
6. Return user's orders only

**Acceptance Criteria:**
- Requires authentication
- Returns only user's orders
- Supports status filtering
- Sorted by date descending
- Returns empty array if no orders
- Handles file read errors

---

## **Phase 4: UI Components - Detailed Specs**

### **Step 20: stripe-elements-provider.tsx**

**File:** `app/_components/stripe-elements-provider.tsx`

**Requirements:**
- Client component wrapper for Stripe Elements
- Load Stripe.js asynchronously
- Accept client secret prop
- Configure Elements with theme options

**Component Specification:**

```typescript
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeElementsProviderProps {
  clientSecret: string;
  children: ReactNode;
}

export function StripeElementsProvider({ 
  clientSecret, 
  children 
}: StripeElementsProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',  // or 'night', 'flat', 'none'
      variables: {
        colorPrimary: '#0070f3',  // Match your brand colors
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
```

**Theme Configuration:**
- `appearance.theme`: Pre-built Stripe themes
- `appearance.variables`: Custom brand colors
- Matches existing app design

**Acceptance Criteria:**
- Loads Stripe.js once (cached)
- Uses publishable key from env
- Applies theme successfully
- No console errors
- Elements render with consistent styling

---

### **Step 21: payment-form.tsx**

**File:** `app/_components/payment-form.tsx`

**Requirements:**
- Client component with Stripe Payment Element
- Handle payment submission
- Show loading and error states
- Success/failure feedback

**Component Specification:**

```typescript
'use client';

import { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';

interface PaymentFormProps {
  amount: number;  // In cents
  bookId: string;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
}

export function PaymentForm({ 
  amount, 
  bookId, 
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Submit payment to Stripe
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setErrorMessage(submitError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // 2. Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',  // Stay on page
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
      });

      if (confirmError) {
        setErrorMessage(confirmError.message || 'Payment confirmation failed');
        setIsProcessing(false);
        return;
      }

      // 3. Confirm with backend
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const response = await fetch('/api/stripe/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });

        const data = await response.json();

        if (response.ok) {
          onSuccess(data.orderId);
        } else {
          onError(data.error || 'Failed to create order');
        }
      }

    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An unexpected error occurred');
      onError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <p className="text-sm text-gray-600 mb-4">
          Total: ${(amount / 100).toFixed(2)}
        </p>
      </div>

      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
    </form>
  );
}
```

**Payment Flow:**
1. User fills payment details in PaymentElement
2. User clicks "Pay" button
3. Form calls `elements.submit()` to validate
4. Form calls `stripe.confirmPayment()` to charge
5. Backend confirms payment and creates order
6. Success callback triggers with order ID

**Acceptance Criteria:**
- PaymentElement renders correctly
- Validates card before submission
- Shows loading state during processing
- Displays error messages
- Calls onSuccess with order ID
- Handles 3D Secure authentication
- Stays on page (no redirect unless required)

---

### **Step 22: checkout-modal.tsx**

**File:** `app/_components/checkout-modal.tsx`

**Requirements:**
- Modal wrapper for payment form
- Show/hide controls
- Loading state during payment intent creation
- Success and error handling

**Component Specification:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { StripeElementsProvider } from './stripe-elements-provider';
import { PaymentForm } from './payment-form';
import { useRouter } from 'next/navigation';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle?: string;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  bookId,
  bookTitle 
}: CheckoutModalProps) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create payment intent when modal opens
  useEffect(() => {
    if (isOpen && !clientSecret) {
      createPaymentIntent();
    }
  }, [isOpen]);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      setClientSecret(data.clientSecret);
      setAmount(data.amount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (orderId: string) => {
    // Close modal and redirect to orders page
    onClose();
    router.push('/orders');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">
          {bookTitle ? `Purchase ${bookTitle}` : 'Complete Purchase'}
        </h2>

        {loading && (
          <div className="py-8 text-center">
            <p className="text-gray-600">Initializing payment...</p>
          </div>
        )}

        {error && !clientSecret && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={createPaymentIntent}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        {clientSecret && (
          <StripeElementsProvider clientSecret={clientSecret}>
            <PaymentForm
              amount={amount}
              bookId={bookId}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </StripeElementsProvider>
        )}
      </div>
    </div>
  );
}
```

**Modal Behavior:**
- Opens when `isOpen={true}`
- Creates Payment Intent on mount
- Shows loading skeleton during initialization
- Renders PaymentForm when ready
- Closes on backdrop click or close button
- Redirects to /orders on success

**Acceptance Criteria:**
- Modal appears centered with backdrop
- Creates Payment Intent automatically
- Shows loading state appropriately
- Payment form renders when ready
- Close button works
- Backdrop click closes modal
- Redirects to orders on success
- Handles errors gracefully

---

### **Step 23: purchase-button.tsx**

**File:** `app/_components/purchase-button.tsx`

**Requirements:**
- Trigger button for checkout modal
- Check auth status before opening
- Pass book data to modal
- Integrate with existing pricing component

**Component Specification:**

```typescript
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CheckoutModal } from './checkout-modal';

interface PurchaseButtonProps {
  bookId: string;
  bookTitle?: string;
  disabled?: boolean;
  className?: string;
}

export function PurchaseButton({ 
  bookId, 
  bookTitle,
  disabled = false,
  className = ''
}: PurchaseButtonProps) {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (status === 'unauthenticated') {
      // Redirect to sign in
      alert('Please sign in to purchase books.');
      return;
    }

    if (status === 'authenticated') {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || status === 'loading'}
        className={`bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {status === 'loading' ? 'Loading...' : 'Purchase Book'}
      </button>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookId={bookId}
        bookTitle={bookTitle}
      />
    </>
  );
}
```

**Button States:**
- **Loading:** Disabled, shows "Loading..."
- **Unauthenticated:** Shows alert, redirects to sign in
- **Authenticated:** Opens checkout modal
- **Disabled prop:** Grayed out (e.g., out of stock)

**Acceptance Criteria:**
- Checks auth status before proceeding
- Shows appropriate messaging
- Opens modal for authenticated users
- Blocks unauthenticated users
- Respects disabled prop
- Passes book data correctly

---

### **Step 24: Update app/books/[slug]/page.tsx**

**File:** `app/books/[slug]/page.tsx`

**Requirements:**
- Import and add PurchaseButton component
- Pass book data to button
- Position below pricing information

**Implementation:**

```typescript
import { PurchaseButton } from '@/app/_components/purchase-button';

export default async function BookPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  // ... existing book fetch logic ...

  return (
    <div>
      {/* ... existing book details ... */}
      
      <Pricing slug={slug} />
      
      <PurchaseButton 
        bookId={slug}
        bookTitle={book.title}
      />
      
      {/* ... rest of page ... */}
    </div>
  );
}
```

**Acceptance Criteria:**
- PurchaseButton appears on book detail pages
- Button positioned near pricing
- Responsive design maintained
- Button functional (opens checkout)

---

## **Phase 5: Order Management - Detailed Specs**

### **Step 25: Create app/orders/page.tsx**

**File:** `app/orders/page.tsx`

**Requirements:**
- Protected page showing user's orders
- Fetch from /api/orders
- Display order list with book details
- Handle empty state
- Link back to books

**Page Specification:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { RequireAuth } from '@/app/_components/auth';
import { Order } from '@/lib/types';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {loading && (
          <p className="text-gray-600">Loading orders...</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No orders yet.</p>
            <Link 
              href="/books" 
              className="text-blue-600 hover:underline"
            >
              Browse books
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.orderId}
                className="border rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {order.bookTitle || order.bookId}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Order ID: {order.orderId}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    order.status === 'succeeded' 
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-4 text-sm">
                  <p className="text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="font-semibold">
                    ${order.price.toFixed(2)} {order.currency.toUpperCase()}
                  </p>
                </div>

                {order.bookSlug && (
                  <Link
                    href={`/books/${order.bookSlug}`}
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    View book →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
```

**Page Behavior:**
- Requires authentication (redirects if not logged in)
- Fetches user's orders on mount
- Shows loading skeleton
- Displays orders with status badges
- Empty state with link to browse books
- Orders sorted by date (newest first)

**Acceptance Criteria:**
- Protected with RequireAuth
- Fetches user-specific orders
- Shows loading state
- Handles errors
- Empty state displays correctly
- Order cards show all relevant data
- Status badges color-coded
- Date formatted nicely
- Links to book detail pages work

---

### **Step 26: Update main-navigation.tsx (Add Orders Link)**

**File:** `app/_components/main-navigation.tsx`

**Requirements:**
- Add "My Orders" link for authenticated users
- Use conditional rendering based on session

**Implementation:**

```typescript
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function MainNavigation() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between">
      <div className="flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/books">Books</Link>
        {session && (
          <Link href="/orders">My Orders</Link>
        )}
      </div>
      
      <AuthButton />
    </nav>
  );
}
```

**Acceptance Criteria:**
- "My Orders" link appears only when authenticated
- Link navigates to /orders page
- Styling consistent with other nav links
- Responsive design maintained

---

## **Phase 6: Testing & Verification - Detailed Specs**

### **Step 27: Create data/orders.json**

**File:** `data/orders.json`

**Requirements:**
- Create empty JSON array for order storage
- Ensure proper file permissions for write access

**Implementation:**
```json
[]
```

**Acceptance Criteria:**
- File exists at `data/orders.json`
- Contains empty array `[]`
- API routes can read/write successfully

---

### **Step 28: Authentication Testing**

**Test Scenarios:**

**1. GitHub OAuth Sign-In**
- **Steps:**
  1. Open application in browser
  2. Click "Sign in with GitHub" button
  3. Authorize on GitHub OAuth consent screen
  4. Verify redirect back to application
- **Expected:**
  - User signed in successfully
  - Avatar appears in navigation
  - Username displayed
  - "Sign out" button visible

**2. Session Persistence**
- **Steps:**
  1. Sign in
  2. Refresh page
  3. Navigate to different pages
- **Expected:**
  - Session persists across page reloads
  - No re-authentication required
  - User data available on all pages

**3. Sign Out**
- **Steps:**
  1. Click "Sign out" button
  2. Verify redirect
  3. Try accessing /orders
- **Expected:**
  - User signed out
  - Session cleared
  - Redirected to home
  - Protected pages redirect to home

**4. Protected Route Access**
- **Steps:**
  1. Sign out
  2. Navigate to `/orders` manually
- **Expected:**
  - Automatically redirected to home
  - Error message or sign-in prompt (optional)

**Acceptance Criteria:**
- All auth flows work without errors
- Session management reliable
- Protected routes properly guarded
- UI updates reflect auth state

---

### **Step 29: Checkout Flow Testing**

**Test Scenarios:**

**1. Guest Checkout Attempt**
- **Steps:**
  1. Sign out
  2. Navigate to book detail page
  3. Click "Purchase Book" button
- **Expected:**
  - Alert: "Please sign in to purchase books"
  - No modal opens
  - User prompted to sign in

**2. Successful Purchase**
- **Steps:**
  1. Sign in with GitHub
  2. Navigate to book detail page (e.g., `/books/dune`)
  3. Click "Purchase Book"
  4. Modal opens with payment form
  5. Enter test card: `4242 4242 4242 4242`
  6. Expiry: Any future date (e.g., `12/34`)
  7. CVC: Any 3 digits (e.g., `123`)
  8. ZIP: Any 5 digits (e.g., `12345`)
  9. Click "Pay $X.XX"
- **Expected:**
  - Payment processes successfully
  - Modal closes
  - Redirected to `/orders`
  - Order appears in list with "succeeded" status
  - Order saved in `data/orders.json` with correct userId

**3. Payment Failure**
- **Steps:**
  1. Use test card: `4000 0000 0000 0002` (declined)
  2. Attempt payment
- **Expected:**
  - Error message displayed
  - Payment not completed
  - No order created
  - User can try again

**4. 3D Secure Authentication**
- **Steps:**
  1. Use test card: `4000 0025 0000 3155` (requires 3DS)
  2. Attempt payment
  3. Complete 3DS modal
- **Expected:**
  - 3DS challenge appears
  - Payment completes after authentication
  - Order created successfully

**5. Out of Stock**
- **Steps:**
  1. Set book availability to "out of stock" in pricing-data.json
  2. Try to purchase
- **Expected:**
  - Error: "Book is out of stock"
  - No Payment Intent created
  - Purchase blocked

**Test Cards Reference:**
- **Success:** `4242 4242 4242 4242`
- **Declined:** `4000 0000 0000 0002`
- **Insufficient funds:** `4000 0000 0000 9995`
- **3D Secure:** `4000 0025 0000 3155`

**Acceptance Criteria:**
- All purchase flows complete successfully
- Test cards behave as expected
- Error handling works correctly
- Orders saved with correct data
- UI feedback clear and timely

---

### **Step 30: Order Management Testing**

**Test Scenarios:**

**1. View Orders List**
- **Steps:**
  1. Sign in
  2. Complete a purchase
  3. Navigate to `/orders`
- **Expected:**
  - Order appears in list
  - Shows book title, price, status, date
  - Status badge color-coded
  - Order ID displayed

**2. Empty Orders State**
- **Steps:**
  1. Sign in with new GitHub account
  2. Navigate to `/orders`
- **Expected:**
  - Empty state message
  - Link to browse books
  - No errors

**3. Multiple Orders**
- **Steps:**
  1. Purchase multiple books
  2. View orders page
- **Expected:**
  - All orders listed
  - Sorted by date (newest first)
  - Each order distinct and correct
  - No duplicates

**4. Order Filtering by User**
- **Steps:**
  1. User A purchases book
  2. User B purchases book
  3. User A views /orders
- **Expected:**
  - User A sees only their order
  - User B's order not visible
  - Proper data isolation

**Acceptance Criteria:**
- Orders page displays correctly
- User-specific filtering works
- Empty state handled
- All order data accurate

---

### **Step 31: Webhook Testing with Stripe CLI**

**Setup:**

**1. Install Stripe CLI**
```bash
# Windows (PowerShell as Administrator)
scoop install stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

**2. Login to Stripe**
```bash
stripe login
```

**3. Forward webhooks to local server**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

**4. Copy webhook signing secret**
- CLI outputs: `whsec_...`
- Update `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

**Test Scenarios:**

**1. Trigger payment_intent.succeeded**
```bash
stripe trigger payment_intent.succeeded
```
- **Expected:**
  - Webhook received at `/api/stripe/webhooks`
  - Order status updated in orders.json
  - Console log: "Payment succeeded: pi_..."

**2. Trigger payment_intent.payment_failed**
```bash
stripe trigger payment_intent.payment_failed
```
- **Expected:**
  - Webhook received
  - Error logged
  - Order status could be updated to "failed" (if implemented)

**3. Verify Signature Validation**
- **Steps:**
  1. Send webhook without signature
  2. Check response
- **Expected:**
  - 400 error returned
  - "No signature" or "Invalid signature" error
  - Webhook rejected

**4. End-to-End Test**
- **Steps:**
  1. Start webhook listener
  2. Complete real purchase in browser
  3. Watch webhook console output
- **Expected:**
  - Webhook automatically sent by Stripe
  - Event processed successfully
  - Order status updated

**Acceptance Criteria:**
- Webhooks received and processed
- Signature verification working
- Order status updates correctly
- Events logged properly
- No crashes or errors

---

## **TESTING CHECKLIST**

### **Authentication**
- [ ] Sign in with GitHub OAuth works
- [ ] Avatar and username display after sign-in
- [ ] Sign out clears session
- [ ] Session persists across page refreshes
- [ ] Protected routes redirect when not authenticated
- [ ] `/orders` page requires authentication

### **Stripe Integration**
- [ ] Stripe.js loads without CSP violations
- [ ] Payment form displays correctly
- [ ] Test card `4242 4242 4242 4242` succeeds
- [ ] Declined card shows error message
- [ ] 3D Secure card triggers authentication
- [ ] Payment Intent created with correct amount and metadata

### **Payment Flow**
- [ ] Guest users blocked from purchasing
- [ ] Authenticated users can open checkout modal
- [ ] Payment processes successfully
- [ ] Order created in orders.json with userId
- [ ] User redirected to /orders after purchase
- [ ] Out of stock books cannot be purchased

### **Order Management**
- [ ] Orders page shows user's orders only
- [ ] Orders sorted by date (newest first)
- [ ] Status badges display correctly
- [ ] Empty state shows when no orders
- [ ] Order details accurate (price, date, status)
- [ ] Links to book pages work

### **Webhooks**
- [ ] Stripe CLI forwards webhooks successfully
- [ ] payment_intent.succeeded updates order status
- [ ] Invalid signatures rejected
- [ ] Events logged correctly
- [ ] No webhook processing errors

### **Security**
- [ ] API routes require authentication
- [ ] Users can only see their own orders
- [ ] Stripe secret key not exposed to client
- [ ] Webhook signatures verified
- [ ] CSRF protection (handled by Next.js)

---

## **ENVIRONMENT VARIABLES SUMMARY**

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# GitHub OAuth
GITHUB_ID=<github-oauth-client-id>
GITHUB_SECRET=<github-oauth-client-secret>

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_<your-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<your-publishable-key>
STRIPE_WEBHOOK_SECRET=whsec_<from-stripe-cli-or-dashboard>

# Existing Variables (Contentful, Algolia, etc.)
# ... keep existing vars ...
```

---

## **DEPLOYMENT CHECKLIST**

### **Before Production**
1. **Create production GitHub OAuth App**
   - Homepage URL: `https://yourdomain.com`
   - Callback URL: `https://yourdomain.com/api/auth/callback/github`
   - Update `GITHUB_ID` and `GITHUB_SECRET` in production env

2. **Use production Stripe keys**
   - Switch from `sk_test_` to `sk_live_`
   - Switch from `pk_test_` to `pk_live_`
   - Create production webhook endpoint in Stripe Dashboard

3. **Configure production webhook**
   - URL: `https://yourdomain.com/api/stripe/webhooks`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

4. **Update NEXTAUTH_URL**
   - Set to production domain: `https://yourdomain.com`

5. **Secure NEXTAUTH_SECRET**
   - Generate new secret for production
   - Store securely in hosting platform env vars

6. **Database Migration (Optional)**
   - Consider moving from JSON to real database (PostgreSQL, MongoDB)
   - Update API routes to use database instead of file system

---

**Relevant Files**

**Existing to reference:**
- [app/_components/pricing.tsx](app/_components/pricing.tsx) — pricing display pattern
- [app/api/pricing/route.ts](app/api/pricing/route.ts) — API route pattern
- [lib/hooks/useFetch.ts](lib/hooks/useFetch.ts) — custom hook pattern
- [data/pricing-data.json](data/pricing-data.json) — pricing data

**New to create (Reusable Auth Module):**
- [lib/auth/config.ts](lib/auth/config.ts) — NextAuth configuration
- [lib/auth/session.ts](lib/auth/session.ts) — session helpers
- [lib/auth/types.ts](lib/auth/types.ts) — auth types
- [lib/auth/index.ts](lib/auth/index.ts) — barrel export
- [app/api/auth/[...nextauth]/route.ts](app/api/auth/[...nextauth]/route.ts) — NextAuth handlers
- [app/_components/auth/auth-button.tsx](app/_components/auth/auth-button.tsx) — sign in/out button
- [app/_components/auth/session-provider.tsx](app/_components/auth/session-provider.tsx) — session provider wrapper
- [app/_components/auth/require-auth.tsx](app/_components/auth/require-auth.tsx) — auth guard component
- [app/_components/auth/index.ts](app/_components/auth/index.ts) — barrel export

**New to create (Stripe Integration):**
- [middleware.ts](middleware.ts) — CSP headers for Stripe domains
- [lib/stripe.ts](lib/stripe.ts)
- [lib/stripe-helpers.ts](lib/stripe-helpers.ts)
- [app/api/stripe/create-payment-intent/route.ts](app/api/stripe/create-payment-intent/route.ts)
- [app/api/stripe/confirm-payment/route.ts](app/api/stripe/confirm-payment/route.ts)
- [app/api/stripe/webhooks/route.ts](app/api/stripe/webhooks/route.ts)
- [app/api/orders/route.ts](app/api/orders/route.ts)
- [app/_components/stripe-elements-provider.tsx](app/_components/stripe-elements-provider.tsx)
- [app/_components/payment-form.tsx](app/_components/payment-form.tsx)
- [app/_components/checkout-modal.tsx](app/_components/checkout-modal.tsx)
- [app/_components/purchase-button.tsx](app/_components/purchase-button.tsx)
- [app/orders/page.tsx](app/orders/page.tsx)
- [data/orders.json](data/orders.json)

**To modify:**
- [package.json](package.json) — add next-auth, Stripe deps
- [app/layout.tsx](app/layout.tsx) — SessionProvider wrapper
- [app/_components/main-navigation.tsx](app/_components/main-navigation.tsx) — auth button, orders link
- [app/books/[slug]/page.tsx](app/books/[slug]/page.tsx) — purchase button
- [lib/types.ts](lib/types.ts) — User, Order, Stripe types

---

**Verification**

1. Install dependencies: `npm install`
2. Set all env vars in `.env.local`
3. **Test auth:**
   - Visit home, click "Sign in with GitHub"
   - Authorize OAuth
   - Verify avatar in nav
4. **Test protected routes:**
   - Sign out, visit `/orders` → redirect
   - Sign in, visit `/orders` → loads
5. **Test checkout:**
   - Visit `/books/dune`, click "Purchase"
   - Fill form: `4242 4242 4242 4242`
   - Verify order in [data/orders.json](data/orders.json) with userId
6. **Test auth-required purchase:**
   - Sign out, click "Purchase" → prompt to sign in
7. **Webhooks:** `stripe listen --forward-to localhost:3000/api/stripe/webhooks`
8. Build: `npm run build` (no errors)
9. Error tests: declined card, out of stock
10. CSP: no violations in dev tools

---

**Decisions**

- **GitHub OAuth Only**: Simple setup, most developers have accounts. Add more providers later.
- **JWT Sessions**: Default NextAuth.js, no database needed.
- **Order Association**: userId + userEmail from session.
- **Protected Routes**: `getServerSession()` checks, 401 if unauthenticated.
- **Embedded Stripe Elements**: On-page forms, requires CSP headers, better UX.
- **Payment Intents API**: Modern, supports SCA/3D Secure.
- **Modal Checkout**: Maintains context, no navigation.
- **JSON Storage**: Matches existing pattern, no DB for MVP.
- **CSP with Middleware**: Using middleware.ts for CSP headers. Runs on Edge runtime, allows dynamic header control per request.

**Scope Included:**
- ✅ NextAuth.js with GitHub OAuth
- ✅ User-specific order history
- ✅ Protected routes/APIs
- ✅ Single-item checkout
- ✅ Embedded payment forms
- ✅ Order storage with userId
- ✅ Webhooks
- ✅ Sign in/out

**Scope Excluded:**
- ❌ Multiple OAuth providers
- ❌ Email/password auth
- ❌ User profiles
- ❌ Shopping cart
- ❌ Subscriptions
- ❌ Email notifications (can add using userEmail later)
- ❌ Refunds
- ❌ Database

---

**Reusable Auth Module Structure**

The auth module (`lib/auth/` and `app/_components/auth/`) is designed to be **copy-paste reusable**:

```
lib/auth/
  ├── config.ts        # NextAuth authOptions (add providers here)
  ├── session.ts       # Server-side helpers (getServerSession, requireAuth)
  ├── types.ts         # User types, module declarations
  └── index.ts         # Export everything

app/_components/auth/
  ├── auth-button.tsx        # Sign in/out button
  ├── session-provider.tsx   # SessionProvider wrapper
  ├── require-auth.tsx       # Client-side auth guard
  └── index.ts               # Export all components

app/api/auth/
  └── [...nextauth]/route.ts # NextAuth handlers (imports from lib/auth)
```

**To reuse in another project:**
1. Copy `lib/auth/` folder
2. Copy `app/_components/auth/` folder  
3. Copy `app/api/auth/[...nextauth]/route.ts`
4. Set env vars: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`
5. Wrap layout with `<AuthSessionProvider>`
6. Done!

---

**Further Considerations**

1. **GitHub OAuth Setup**: Need detailed steps? **Recommendation:** Yes, add to docs.
2. **Payment Intent Metadata**: Store bookTitle, bookSlug, userId, userEmail? **Recommendation:** Yes.
3. **Currency**: USD only? **Recommendation:** Yes for now.
4. **Stripe Elements Styling**: Match Tailwind theme? **Recommendation:** Yes.
5. **Email Confirmations**: Use userEmail for order emails? **Recommendation:** Excluded for now, easy to add later.
6. **Auth Module as Package**: Should we make it an npm package? **Recommendation:** For now, keep as folder. Can extract to package later if used across 3+ projects.
