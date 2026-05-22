# Architecture

## Big Picture

- Next.js App Router app.
- Most screens are client components.
- Firebase Auth handles users.
- Firestore stores app data.
- Firebase Admin SDK is used by newer trusted server helpers.
- Cloudflare R2 stores uploaded images through signed URLs.
- PWA support is configured through `@ducanh2912/next-pwa`.

## Stack

- Frontend: Next.js 16, React 18, JavaScript.
- Styling: Tailwind CSS with `kasi` color tokens.
- Auth: Firebase Auth plus a soft `kasi_auth` UID cookie.
- Data: Firestore.
- Server routes: Next.js API routes under `app/api`.
- Storage: Cloudflare R2 through S3-compatible SDK.
- Tests: Node test runner covers shared marketplace lifecycle helpers.
- Deploy: no repo-specific deploy config found. [VERIFY]

## Important Folders

- `app/` — routes, pages, layout, middleware, API routes.
- `app/admin/` — custom admin dashboard and operations.
- `app/api/` — protected server routes for uploads, postbacks, admin actions.
- `components/` — shared UI, nav, tutorial, upload, verification gate.
- `lib/` — Firebase client setup and domain helpers.
- `lib/client/` — browser-only helpers, mainly authenticated fetches.
- `lib/server/` — server-only Firebase Admin, R2, postback, referral, payout, and task helpers.
- `public/` — icons, mascot, manifest, animation assets, PWA output.

## Main Data Flows

- User opens a page in `app/`.
- Client reads Firebase Auth state.
- Page calls helper functions in `lib/`.
- Helper reads/writes Firestore, or calls an API route for trusted work.
- API routes verify Firebase ID tokens when sensitive.
- R2 routes return signed upload/view URLs.

## Product Flows

- Tasks: admin creates task, user submits proof, admin reviews, approval credits balance and transaction.
- Jobs: user submits a job for review, jobs list/detail display real Firestore records, worker applies through `jobApplications`, and poster actions move applications through shortlist/accept/reject/complete.
- Messaging: `/messages` reads participant-only `messageThreads`; replies and read markers go through Firebase Admin-backed API routes and nested `messages` subcollections.
- Verification: unverified users are routed to `/verify-email`; verified status syncs to Firestore user docs; custom verification emails use a Firebase Admin action link plus Resend.

## Collections Seen In Code

- `users`
- `tasks`
- `submissions`
- `transactions`
- `jobs`
- `jobApplications`
- `messageThreads`
- `messageThreads/{threadId}/messages`
- `counters`

## Auth Notes

- Middleware only checks whether the `kasi_auth` cookie exists.
- The cookie is a UX gate, not a strong server session.
- Sensitive API routes should use `requireServerUser` or `requireServerAdmin`.
- Email verification is currently enforced mostly client-side.

## External Services

- Firebase Auth — login, register, email verification.
- Resend — custom HTML verification email delivery when configured.
- Firestore — app data and money-like records.
- Firebase Admin SDK — trusted server route checks and mutations.
- Cloudflare R2 — image storage.
- AdGem-like postback — inferred from route and params. [VERIFY]
- Stripe — planned idea only, not in code.

## Important Notes

- Firestore schema is implicit in code.
- `firestore.rules` includes beta `jobApplications`, participant-only `messageThreads`, and nested message read coverage, but still needs emulator validation.
- Message inbox queries avoid a composite index by querying participants first and sorting client-side.
- `/api/r2` and `/api/upload` overlap; consolidate later.
- Money-like updates still happen from more than one path.
- Messaging is private to participants in the demo slice, but it is not moderated or notification-ready production chat yet.
- Local server-backed routes need Firebase Admin credentials configured; `FIREBASE_ADMIN_PROJECT_ID` falls back to `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
- `/api/auth/debug` is development-only and exists to diagnose local Firebase client/Admin project mismatches.
- `/api/auth/send-verification-email` needs `RESEND_API_KEY`, `EMAIL_FROM`, and `NEXT_PUBLIC_APP_URL` for the custom email loop.
