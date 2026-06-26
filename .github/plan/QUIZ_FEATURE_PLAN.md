# Plan: Quiz Builder & Viewer Feature

## TL;DR
Build a complete quiz feature: (1) **Landing page** at `/quiz-landing` with full-page parallax hero and featured quizzes showcase; (2) **Admin-only Quiz-builder** with react-hook-form to create quizzes with mixed single/multiple-choice questions, store in Contentful CMS; (3) **Public Quiz-viewer** for taking quizzes with QR code generation for results (encoded as JSON). Protect builder with URL token pattern (like draft preview). Follow existing GraphQL/API patterns and Tailwind styling conventions.

## Decisions Made
- **Admin protection**: URL token query param (`?token=${QUIZ_BUILDER_TOKEN}`) matching draft mode pattern
- **Quiz storage**: Contentful CMS as single source of truth (new Content Model: Quiz)
- **Question types**: Mixed — creator chooses per-question between single/multiple choice
- **QR code content**: Encoded JSON with quiz result data (score, answers, timestamp)
- **Form library**: react-hook-form for dynamic field arrays (infinite questions)
- **QR library**: qrcode.react (simple, sufficient)
- **State management**: No global state, pure React hooks (consistent with app)
- **Landing page**: Separate marketing page at `/quiz-landing` with parallax hero (multiple layers) and featured quizzes showcase
- **Parallax implementation**: CSS transforms + scroll event listener (no external library) for better performance and consistency with existing tech stack

## Environment Variables & Configuration

### NEXT_PUBLIC_QUIZ_BUILDER_TOKEN
**Purpose**: Protect the quiz builder page from unauthorized access.

**Setup**:
1. Generate a secure token (e.g., using `openssl rand -base64 32` or similar)
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_QUIZ_BUILDER_TOKEN=your-secure-token-here
   ```

**Usage**:
- Quiz-builder page checks URL query parameter: `/quiz-builder?token=YOUR_TOKEN`
- Token must match `process.env.NEXT_PUBLIC_QUIZ_BUILDER_TOKEN`
- If token is missing or invalid, user sees "Access Denied" page
- This is a simple but effective pattern similar to Contentful's draft preview mode

**Security Notes**:
- This token is exposed in the browser (hence "NEXT_PUBLIC_")
- It's NOT a replacement for proper authentication
- For production, implement OAuth/session-based auth instead
- Token provides "security through obscurity" — good enough for admin access in private deployments

## Steps

### Phase 1: Content Model & Data Fetching

**1.1 Create Contentful Quiz Content Model** (*sequential, blocks Phase 2*)
- Create `cms-cli-scripts/content-types/quiz.js` with fields:
  - `title` (Text, required)
  - `slug` (Text, required, unique, validation pattern: `^[a-z0-9-]+$`)
  - `description` (RichText)
  - `questions` (JSON Object array): Each question has:
    - `id` (UUID, auto-generated)
    - `question` (string)
    - `questionType` ("single" | "multiple")
    - `answers` (array of objects): `{ id, text, isCorrect }`
    - `order` (number)
  - `passingScore` (Integer, percentage, 0-100)
  - `published` (Boolean)
- Create migration file for rollout

**1.2 Update GraphQL Fragments** (*depends on 1.1*)
- Add `quiz` fragment in lib/graphql/quiz-fragments.ts querying all Quiz fields
- Include nested question/answer structure

**1.3 Create API Fetcher Functions** (*depends on 1.2*)
- Add to lib/api.ts:
  - `getAllQuizzes()` — fetch published quizzes
  - `getQuizBySlug(slug)` — fetch single quiz with full question/answer structure
  - `createQuiz(data)` — GraphQL mutation via Contentful API (admin token required)
  - `updateQuiz(id, data)` — GraphQL mutation

---

### Phase 2: Quiz-Builder Page (Admin-Only)

**2.1 Create Quiz-builder Page & Layout** (*depends on 1.3, parallel with 2.2*)
- Create `app/quiz-builder/page.tsx`
- Implement URL token protection middleware/component
- Layout: Header, main form area, sidebar (preview/help)

**2.2 Create Quiz-builder Form Component** (*parallel with 2.1, depends on 1.3*)
- Create `app/_components/quiz-builder/index.tsx` (main builder form)
- Use react-hook-form with `useFieldArray` for infinite questions

**2.3 Create Supporting Components** (*depends on 2.2*)
- `app/_components/quiz-builder/question-editor.tsx`
- `app/_components/quiz-builder/answer-editor.tsx`
- `app/_components/quiz-builder/preview-panel.tsx`
- `app/_components/quiz-builder/form-actions.tsx`

**2.4 Add Dependencies**
- Run: `npm install react-hook-form` (if not already present)

---

### Phase 3: Quiz-Viewer Page (Public)

**3.1 Create Quiz-viewer Page** (*depends on 1.3*)
- Create `app/quiz/[slug]/page.tsx`

**3.2 Create Quiz-results Page** (*depends on 3.1*)
- Create `app/quiz/[slug]/results/page.tsx`

**3.3 Create Supporting Components** (*depends on 3.1, 3.2*)
- `app/_components/quiz-viewer/question-renderer.tsx`
- `app/_components/quiz-viewer/progress-bar.tsx`
- `app/_components/quiz-viewer/results-display.tsx`
- `app/_components/quiz-viewer/qr-code-generator.tsx`

**3.4 QR Code Generation Logic** (*depends on 3.3*)
- Create `lib/qr-code-utils.ts`

---

### Phase 4: Integration & Polish

**4.1 Add Quiz to Main Navigation** (*depends on 2.1, 3.1*)
- Update app/_components/main-navigation/index.tsx

**4.2 Create Quiz Index/Discovery Page** (optional, depends on 3.1)
- Create `app/quiz/page.tsx`

**4.3 Error Handling & Edge Cases** (*parallel with 4.1, 4.2*)

**4.4 Styling & Responsive Design** (*parallel with 4.1, 4.2*)

---

### Phase 5: Quiz Landing Page with Parallax

**5.1 Create Quiz Landing Page** (*independent, can run parallel to phases 2-4*)
- Create `app/quiz-landing/page.tsx`

**5.2 Create Parallax Hero Component** (*depends on 5.1*)
- Create `app/_components/quiz-landing/parallax-hero.tsx`

**5.3 Create Feature Highlights Component** (*depends on 5.1*)
- Create `app/_components/quiz-landing/feature-highlights.tsx`

**5.4 Create Featured Quizzes Component** (*depends on 5.1*)
- Create `app/_components/quiz-landing/featured-quizzes.tsx`

**5.5 Add Landing Link to Navigation** (*depends on 5.1*)
- Update app/_components/main-navigation/index.tsx

---

## Verification

### 0. Environment Setup
- [ ] `NEXT_PUBLIC_QUIZ_BUILDER_TOKEN` set in `.env.local`
- [ ] `CONTENTFUL_SPACE_ID` configured (existing)
- [ ] `CONTENTFUL_ACCESS_TOKEN` configured with admin permissions (existing)
- [ ] `CONTENTFUL_PREVIEW_ACCESS_TOKEN` configured (existing)
- [ ] Verify with: `npm run build` (should compile without errors)

### 1. Content Model & API
- [ ] Quiz content model created in Contentful
- [ ] Migration script runs without errors
- [ ] `getQuizBySlug()` returns quiz with nested questions/answers
- [ ] Contentful token in .env includes necessary permissions

### 2. Quiz-Builder Functionality
- [ ] `/quiz-builder` redirects to error page without `?token=` param
- [ ] `/quiz-builder?token=valid_token` renders form
- [ ] Form allows adding/removing infinite questions
- [ ] Save to Contentful creates new quiz in CMS

### 3. Quiz-Viewer Functionality
- [ ] `/quiz/:slug` fetches and renders quiz
- [ ] Single-choice questions show radio buttons
- [ ] Multiple-choice questions show checkboxes
- [ ] Results page shows score and pass/fail badge

### 4. QR Code
- [ ] QR code renders on results page
- [ ] QR code is downloadable/scannable
- [ ] Encoded data contains quiz slug, score, answers, timestamp

### 5. Landing Page & Parallax
- [ ] `/quiz-landing` page loads correctly
- [ ] Parallax hero works on desktop
- [ ] Parallax disabled on mobile for performance
- [ ] Feature highlights display correctly
- [ ] Featured quizzes grid displays and links work

### 6. Integration & Navigation
- [ ] Main navigation links work correctly
- [ ] Error boundaries catch component errors
- [ ] Mobile responsive
- [ ] No console errors

### 7. Styling & UX
- [ ] Consistent with existing app styling (Tailwind)
- [ ] Form inputs accessible
- [ ] Loading states shown
- [ ] Empty states handled
