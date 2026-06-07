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
- Add `quiz` fragment in [lib/graphql/fragments.ts](lib/graphql/fragments.ts) querying all Quiz fields
- Include nested question/answer structure

**1.3 Create API Fetcher Functions** (*depends on 1.2*)
- Add to [lib/api.ts](lib/api.ts):
  - `getAllQuizzes()` — fetch published quizzes
  - `getQuizBySlug(slug)` — fetch single quiz with full question/answer structure
  - `createQuiz(data)` — GraphQL mutation via Contentful API (admin token required)
  - `updateQuiz(id, data)` — GraphQL mutation

---

### Phase 2: Quiz-Builder Page (Admin-Only)

**2.1 Create Quiz-builder Page & Layout** (*depends on 1.3, parallel with 2.2*)
- Create `app/quiz-builder/page.tsx`
- Implement URL token protection middleware/component:
  - Check `?token=` param against `process.env.QUIZ_BUILDER_TOKEN`
  - Redirect to `/quiz-builder?error=unauthorized` if missing/invalid
  - Pattern: Similar to draft preview secret validation
- Layout: Header (title, back button), main form area, sidebar (preview/help)

**2.2 Create Quiz-builder Form Component** (*parallel with 2.1, depends on 1.3*)
- Create `app/_components/quiz-builder/index.tsx` (main builder form)
- Use react-hook-form with `useFieldArray` for infinite questions:
  - Top-level form: `title`, `slug`, `description`, `passingScore`
  - Dynamic `questions` field array with add/remove buttons
  - Per-question: `question` text, `questionType` radio (single/multiple), `answers` field array
  - Per-answer: `text`, `isCorrect` checkbox (single-type shows one radio, multiple allows many checkboxes)
- State: Track unsaved changes warning
- Actions: Save to Contentful, Draft save (localStorage), Preview toggle

**2.3 Create Supporting Components** (*depends on 2.2*)
- `app/_components/quiz-builder/question-editor.tsx` — Reusable question form section with conditional answer type rendering
- `app/_components/quiz-builder/answer-editor.tsx` — Single answer row with text + correct flag
- `app/_components/quiz-builder/preview-panel.tsx` — Real-time quiz preview (show how quiz looks in viewer)
- `app/_components/quiz-builder/form-actions.tsx` — Save/Draft/Cancel buttons with loading states

**2.4 Add Dependencies**
- Run: `npm install react-hook-form` (if not already present)
- Verify Contentful API client availability for mutations

---

### Phase 3: Quiz-Viewer Page (Public)

**3.1 Create Quiz-viewer Page** (*depends on 1.3*)
- Create `app/quiz/[slug]/page.tsx` (matches books/:slug pattern)
- Implement:
  - Fetch quiz by slug (server-side)
  - Client-side quiz state: current question index, selected answers per question
  - Render current question + answers (radio for single, checkboxes for multiple)
  - Navigation: Previous/Next buttons, Progress bar
  - Validation: Warn if question skipped
  - Submit button on last question → Calculate results

**3.2 Create Quiz-results Page** (*depends on 3.1*)
- Create `app/quiz/[slug]/results/page.tsx`
- Display:
  - Score (percentage + count)
  - Pass/Fail status based on passing score
  - Review answers (show question → user answer → correct answer with explanation)
  - QR Code section: Generate QR code encoding result data
- Results stored in client-side state or URL params (URL params preferred for shareable results)

**3.3 Create Supporting Components** (*depends on 3.1, 3.2*)
- `app/_components/quiz-viewer/question-renderer.tsx` — Renders single question with answer options (conditional single vs. multiple)
- `app/_components/quiz-viewer/progress-bar.tsx` — Shows current question / total
- `app/_components/quiz-viewer/results-display.tsx` — Score, pass/fail badge, answer review table
- `app/_components/quiz-viewer/qr-code-generator.tsx` — Generates + displays QR code with download button

**3.4 QR Code Generation Logic** (*depends on 3.3*)
- Create `lib/qr-code-utils.ts`:
  - `generateQuizResultQRData(quizSlug, score, answers, timestamp)` — JSON stringified data
  - `encodeQuizResultURL(quizSlug, resultId)` — Generate shareable result link (URL encoded in QR)
  - Consider: Compress JSON or use URL shortener for smaller QR codes
- Use `qrcode.react` (QRCode component) in qr-code-generator component

---

### Phase 4: Integration & Polish

**4.1 Add Quiz to Main Navigation** (*depends on 2.1, 3.1*)
- Update [app/_components/main-navigation/index.tsx](app/_components/main-navigation/index.tsx):
  - Add "Quizzes" link to `/quiz` or quiz index page
  - Add admin link "Build Quiz" (visible only with token param)

**4.2 Create Quiz Index/Discovery Page** (optional, depends on 3.1)
- Create `app/quiz/page.tsx` — List all published quizzes
- Link to individual quiz viewer pages
- Use book-list patterns (grid, filters by category if added to model)

**4.3 Error Handling & Edge Cases** (*parallel with 4.1, 4.2*)
- Error boundary around quiz components (existing pattern in ErrorBoundary)
- Handle: Quiz not found, malformed questions, network errors during save
- Loading states: Skeleton or spinner on data fetch

**4.4 Styling & Responsive Design** (*parallel with 4.1, 4.2*)
- Use Tailwind (no component library)
- Mobile-first responsive layout for quiz form and viewer
- Ensure readability on small screens (questions, answer options, progress bar)

---

### Phase 5: Quiz Landing Page with Parallax

**5.1 Create Quiz Landing Page** (*independent, can run parallel to phases 2-4*)
- Create `app/quiz-landing/page.tsx` — Dedicated marketing landing page
- Structure:
  - Full-page parallax hero (multiple layers with different scroll speeds)
  - Feature highlights section (3-4 cards explaining quiz benefits)
  - Featured quizzes showcase (grid of popular/curated quizzes)
  - CTA buttons: "Create Quiz" (→ builder with token), "Browse All Quizzes" (→ /quiz)
  - Footer with navigation links

**5.2 Create Parallax Hero Component** (*depends on 5.1*)
- Create `app/_components/quiz-landing/parallax-hero.tsx`
- Implement multi-layer parallax effect:
  - Background layer (moves slowest)
  - Mid-layer image/text
  - Foreground layer (moves fastest)
  - Use CSS transforms + `window.scrollY` event listener for smooth performance
  - Fallback styling for no-JS environments
  - Mobile: Reduce parallax effect on small screens (or disable) for better performance

**5.3 Create Feature Highlights Component** (*depends on 5.1*)
- Create `app/_components/quiz-landing/feature-highlights.tsx`
- Display 3-4 feature cards with:
  - Icon/illustration
  - Title (e.g., "Create & Share", "Interactive Learning", "Instant Results")
  - Brief description
  - Tailwind grid layout (responsive: 1 col mobile, 2-3 cols desktop)

**5.4 Create Featured Quizzes Component** (*depends on 5.1*)
- Create `app/_components/quiz-landing/featured-quizzes.tsx`
- Fetch featured quizzes from Contentful:
  - Query top 6 published quizzes (or add `featured` boolean flag to Quiz model)
  - Display as grid cards with:
    - Quiz title, description preview, question count
    - Link to quiz viewer (`/quiz/[slug]`)
    - Tailwind grid (responsive: 1 col mobile, 2-3 cols tablet, 3 cols desktop)

**5.5 Add Landing Link to Navigation** (*depends on 5.1*)
- Update [app/_components/main-navigation/index.tsx](app/_components/main-navigation/index.tsx):
  - Add "Quiz" or "Take a Quiz" link to `/quiz-landing`

---

## Relevant Files

### Files to Create
- `cms-cli-scripts/content-types/quiz.js` — Contentful Quiz model definition
- `cms-cli-scripts/migrations/add-quiz-model.js` — Migration script
- `lib/graphql/quiz-fragments.ts` — GraphQL query fragments for Quiz
- `lib/qr-code-utils.ts` — QR code encoding/generation utilities
- `lib/quiz-api.ts` — Quiz-specific API functions (getQuizBySlug, createQuiz, etc.)
- `app/quiz-builder/page.tsx` — Admin quiz builder page
- `app/quiz/[slug]/page.tsx` — Quiz viewer page
- `app/quiz/[slug]/results/page.tsx` — Results/QR code page
- `app/quiz/page.tsx` — Quiz index/discovery (optional)
- `app/_components/quiz-builder/index.tsx` — Main builder form component
- `app/_components/quiz-builder/question-editor.tsx` — Question editing component
- `app/_components/quiz-builder/answer-editor.tsx` — Answer editing component
- `app/_components/quiz-builder/preview-panel.tsx` — Preview panel component
- `app/_components/quiz-builder/form-actions.tsx` — Form action buttons
- `app/_components/quiz-viewer/question-renderer.tsx` — Render quiz question
- `app/_components/quiz-viewer/progress-bar.tsx` — Progress indicator
- `app/_components/quiz-viewer/results-display.tsx` — Results summary
- `app/_components/quiz-viewer/qr-code-generator.tsx` — QR code display component
- `app/quiz-landing/page.tsx` — Landing page with parallax hero and featured quizzes
- `app/_components/quiz-landing/parallax-hero.tsx` — Multi-layer parallax hero component
- `app/_components/quiz-landing/feature-highlights.tsx` — Feature cards showcase
- `app/_components/quiz-landing/featured-quizzes.tsx` — Featured quizzes grid

### Files to Modify
- [package.json](package.json) — Add `react-hook-form` and `qrcode.react` dependencies
- [lib/api.ts](lib/api.ts) — Add quiz fetching functions (or create separate lib/quiz-api.ts)
- [lib/graphql/fragments.ts](lib/graphql/fragments.ts) — Add quiz fragment
- [app/_components/main-navigation/index.tsx](app/_components/main-navigation/index.tsx) — Add quiz links
- [tailwind.config.ts](tailwind.config.ts) — Extend config if custom quiz styling needed (likely not needed)

---

## Verification

### 1. Content Model & API
- [ ] Quiz content model created in Contentful (visible in content modeling UI)
- [ ] Migration script runs without errors: `node cms-cli-scripts/migrations/add-quiz-model.js`
- [ ] `getQuizBySlug()` returns quiz with nested questions/answers (test in API route)
- [ ] Contentful token in .env includes necessary permissions for mutations

### 2. Quiz-Builder Functionality
- [ ] `/quiz-builder` redirects to error page without `?token=` param
- [ ] `/quiz-builder?token=valid_token` renders form
- [ ] Form allows adding/removing infinite questions
- [ ] Toggling question type (single ↔ multiple) updates answer UI (radio → checkbox)
- [ ] Save to Contentful creates new quiz in CMS (verify in Contentful UI)
- [ ] Unsaved changes warning appears on page nav
- [ ] Form validation: slug format, required fields
- [ ] Preview panel shows quiz as user would see it

### 3. Quiz-Viewer Functionality
- [ ] `/quiz/:slug` fetches and renders quiz (use created quiz)
- [ ] Single-choice questions show radio buttons (only one selectable)
- [ ] Multiple-choice questions show checkboxes (multiple selectable)
- [ ] Previous/Next buttons navigate between questions
- [ ] Progress bar updates with current question
- [ ] Submit on last question calculates score based on selected answers
- [ ] Results page shows score percentage, pass/fail badge
- [ ] Answer review shows all questions with user answers highlighted
- [ ] QR code generated with result data encoded (decode with QR reader to verify JSON)

### 4. QR Code
- [ ] QR code renders on results page
- [ ] QR code is downloadable/scannable
- [ ] Encoded data contains quiz slug, score, answers, timestamp
- [ ] Size is reasonable (not too large for small screens)

### 5. Landing Page & Parallax
- [ ] `/quiz-landing` page loads and renders correctly
- [ ] Parallax hero works on desktop (layers move at different speeds on scroll)
- [ ] Parallax disabled or reduced on mobile for performance
- [ ] Feature highlights section displays 3-4 feature cards (responsive grid)
- [ ] Featured quizzes grid displays and links to quiz viewer
- [ ] CTA buttons present: "Create Quiz" (with token param), "Browse All Quizzes"
- [ ] Parallax fallback works on no-JS environments (static layout)

### 6. Integration & Navigation
- [ ] Main navigation links to quiz landing page and quiz index
- [ ] Landing page link navigates correctly to `/quiz-landing`
- [ ] Error boundary catches component errors gracefully
- [ ] Mobile responsive: test on small/medium/large screens
- [ ] No console errors or warnings

### 7. Styling & UX
- [ ] Consistent with existing app styling (Tailwind, typography)
- [ ] Form inputs are accessible (labels, ARIA attributes)
- [ ] Loading states shown during data fetch/save
- [ ] Empty states handled (no quizzes, no questions, etc.)

---

## Further Considerations

1. **Quiz Results Storage**: Currently results are ephemeral (client-side state). Should results be logged to a database for analytics (e.g., track how many users passed a specific quiz)? *Recommendation: Start without logging; add later if needed.*

2. **Question Explanations**: Should questions optionally include explanations shown after quiz completion? *Recommendation: Add `explanation` field to question model in Phase 1 for future use.*

3. **Quiz Categories/Tags**: Should quizzes be filterable/searchable? *Recommendation: Add `categories` relationship field to Quiz model if quiz index grows.*

4. **Timed Quizzes**: Should quizzes have a time limit per question or overall? *Recommendation: Out of scope for MVP; add `timeLimit` field to model if needed later.*

5. **Admin Auth Enhancement**: URL token is simple but not ideal for multiple admins. Future upgrade to session-based auth recommended as feature matures.