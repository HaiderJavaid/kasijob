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
- Tests: none found.
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
- Jobs: user submits job for review, jobs list/detail display records and samples, worker applies through `jobApplications`.
- Messaging: `/messages` reads signed-in `messageThreads` or sample threads; Firestore replies are not production-private yet.
- Verification: unverified users are routed to `/verify-email`; verified status syncs to Firestore user docs.

## Collections Seen In Code

- `users`
- `tasks`
- `submissions`
- `transactions`
- `jobs`
- `jobApplications`
- `messageThreads`
- `counters`

## Auth Notes

- Middleware only checks whether the `kasi_auth` cookie exists.
- The cookie is a UX gate, not a strong server session.
- Sensitive API routes should use `requireServerUser` or `requireServerAdmin`.
- Email verification is currently enforced mostly client-side.

## External Services

- Firebase Auth — login, register, email verification.
- Firestore — app data and money-like records.
- Firebase Admin SDK — trusted server route checks and mutations.
- Cloudflare R2 — image storage.
- AdGem-like postback — inferred from route and params. [VERIFY]
- Stripe — planned idea only, not in code.

## Important Notes

- Firestore schema is implicit in code.
- `firestore.rules` includes beta `jobApplications` coverage and demo `messageThreads` reads, but still needs emulator validation.
- `messageThreads` lacks participant IDs, so client writes should stay blocked until the schema changes.
- `/api/r2` and `/api/upload` overlap; consolidate later.
- Money-like updates still happen from more than one path.
- Messaging is not private production chat yet.
