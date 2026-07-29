# Finance Dashboard

A full-stack finance dashboard built with Next.js (App Router), MongoDB, Bootstrap 5, and
Recharts. Each user has their own account and their own persisted dashboard (transactions,
role, dark mode preference, profile photo), and an AI Financial Advisor panel powered by Gemini
through a secure server-side API route.

Originally a React 18 + Vite SPA with `localStorage` persistence, migrated to Next.js, then
upgraded from a local single-user app into a real multi-user, database-backed one. See
"Migration Notes" below for both steps.

## Features

### 1. Authentication
- Email/password signup and login
- Passwords hashed with `bcryptjs` (never stored in plain text)
- Sessions are a JWT (`jose`) in an `httpOnly` cookie -- never in `localStorage`, never readable
  by client-side JavaScript
- `src/proxy.js` redirects signed-out visitors away from the dashboard to `/login`, and signed-in
  visitors away from `/login`/`/signup` back to the dashboard

### 2. Per-User Dashboards
- Transactions, role, and dark mode are stored in MongoDB on each user's document, not
  `localStorage` -- log in from a different browser or device and your data is exactly where you
  left it
- Every data route re-verifies the session and scopes all reads/writes to that verified user's
  `_id` -- one user can never read or write another's data, regardless of what a request claims

### 3. Profile Photo
- Upload a profile picture from the dashboard header; stored via Cloudinary, with the resulting
  URL saved on the user's document and shown as the avatar in the header

### 4. Dashboard Overview
- Summary cards for total balance, income, and expenses
- Balance trend line chart, spending breakdown pie chart
- Staggered fade-in-and-slide-up entrance animation (Framer Motion) on load

### 5. Transactions Section
- Table with date, amount, category, and type
- Search by category or amount, filter by income/expense, sort by date or amount

### 6. Role-Based UI
- `Viewer` can browse dashboard data only; `Admin` can add and edit transactions
- Role switching via dropdown, for demonstration -- it's a per-account field a user can toggle on
  themselves, not a real permissions system

### 7. Insights
- Highest spending category, month-over-month expense comparison, transaction count, lifetime expenses

### 8. AI Financial Advisor
- Sends the current transaction history to `/api/gemini`, an authenticated Route Handler that
  calls the Gemini API (`@google/genai`) server-side -- the Gemini key never reaches the browser

## Tech Stack
- Next.js 16 (App Router, `proxy.js`)
- React 19
- MongoDB + Mongoose
- `jose` (JWT) + `bcryptjs` (password hashing)
- Cloudinary (profile photos)
- Framer Motion
- Bootstrap 5, Recharts
- `@google/genai` + `react-markdown`
- JavaScript

## Project Structure

```text
src/
  app/
    layout.jsx           Root layout: fonts, Bootstrap CSS, theme-flash script, providers
    page.jsx              Dashboard route ("/")
    login/page.jsx         Login page
    signup/page.jsx         Signup page
    api/
      auth/
        signup/route.js     POST -- create account, set session
        login/route.js       POST -- verify credentials, set session
        logout/route.js       POST -- clear session
        me/route.js            GET -- current user's identity
      user/
        data/route.js        GET/PUT -- role, darkMode, transactions
        photo/route.js         POST -- profile photo upload (Cloudinary)
      gemini/route.js       POST -- AI advisor (authenticated)
  charts/                Recharts chart components ('use client')
  components/            Reusable UI pieces (incl. ProfileMenu, MotionSection)
  context/               AuthContext (identity) + AppContext (dashboard data)
  data/                  Mock transaction seed data (used as a new user's starting data)
  lib/
    mongodb.js             Mongoose connection singleton
    auth.js                 JWT sign/verify, session + theme cookies (server-only)
    cloudinary.js             Cloudinary config (server-only)
  models/
    User.js                Mongoose schema: auth fields + embedded transactions
  utils/                  Formatting, finance helpers
  views/                  Page-level composition (DashboardPage)
  proxy.js                Redirects based on auth state (Next.js 16's renamed middleware.js)
```

## Setup

### Prerequisites
- Node.js 20+, npm
- A MongoDB connection string (MongoDB Atlas free tier works fine)
- A Cloudinary account (free tier) for profile photo uploads
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Install and run

```bash
npm install
cp .env.example .env.local   # then fill in every value -- see .env.example
npm run dev
```

### Build

```bash
npm run build
npm run start
```

## Notes for Reviewers
- Every write to `/api/user/*` re-derives the user id from the verified session cookie -- the
  request body is never trusted for identity
- `src/proxy.js` only checks whether the session JWT is present and validly signed (no database
  call); each API route independently re-verifies before touching data, so no single layer is
  the only thing standing between a request and the database
- Login returns the same error for "no such account" and "wrong password," and always runs a
  real `bcrypt.compare` (against a fixed dummy hash when there's no matching account) so response
  time can't be used to enumerate registered emails
- The AI Advisor panel degrades gracefully (a clear error + retry button) if `GEMINI_API_KEY` is
  missing or the upstream request fails

## Migration Notes (Vite SPA -> Next.js -> full-stack)

### Vite -> Next.js App Router
- No router was in use (single dashboard view), so this became a single `/` route.
- Bootstrap was CSS-only in the original build, which simplified the move considerably.
- The old `pages/` folder was renamed to `views/` -- Next.js's own (legacy) Pages Router also
  looks for a `pages/` directory, so keeping that name inside an App Router project risks a
  routing collision.
- `AIFinancialAdvisor.jsx` calls `POST /api/gemini` instead of the Gemini SDK directly from the
  browser, keeping the API key server-side.

### Local SPA -> full-stack SaaS
- `AppContext` no longer reads/writes `localStorage`. It starts with fixed defaults (so server
  and client render the same thing), then loads this user's real data from `/api/user/data` in
  an effect once `AuthContext` confirms who's logged in -- same hydration-guard shape as the
  localStorage version had, just backed by Mongo instead of the browser.
- Dark mode's "no flash on reload" trick changed with it: the old inline script read
  `localStorage` directly, which is instant. Per-user dark mode now lives in MongoDB, which needs
  a network round trip -- too slow to check before first paint. The fix is a second, non-sensitive
  cookie (`fd_theme`, not `httpOnly`) that mirrors `darkMode` and gets set alongside the session
  cookie on login/signup and on every save. The theme-init script reads that cookie instead of
  `localStorage` -- same instant, no-flash effect, now correct per account.
- `middleware.js` is `src/proxy.js` here -- Next.js 16 renamed the file and the exported function
  (`middleware` -> `proxy`); the old name still works but is deprecated.
- Transactions are embedded on the `User` document rather than a separate collection, matching
  how the frontend already reads/writes them as one array. A separate `Transaction` collection
  with a `userId` reference would be the natural next step if this ever needed to scale past a
  personal-finance-demo amount of data per user.

## Future Enhancements
- Export transactions as CSV or JSON
- More advanced filters (category, date range)
- Move transactions to their own collection if data volume grows
- Email verification / password reset flow
- Inline delete actions with confirmation
