# Decisions

## Use Next.js App Router

- What: routes, layouts, middleware, and API handlers live under `app/`.
- Why: current app is built this way.
- Tradeoff: use App Router conventions, not Pages Router.

## Use Firebase Auth And Firestore

- What: Firebase Auth manages users; Firestore stores app data.
- Why: existing code is built around Firebase SDKs.
- Tradeoff: schema is implicit unless documented separately.

## Split Client And Server Helpers

- What: browser helpers live in `lib/client`; trusted helpers live in `lib/server`.
- Why: auth, R2, postbacks, admin tasks, referrals, and payouts need clearer runtime boundaries.
- Tradeoff: more explicit imports and more route plumbing.

## Protect Sensitive API Routes With Firebase Admin

- What: newer protected API routes verify Firebase ID tokens.
- Why: client cookies and client-side role checks are not enough.
- Tradeoff: deployment needs Firebase Admin env vars.

## Treat Firebase Auth As Email Verification Source

- What: UI and sync helpers should trust `currentUser.emailVerified` first, then update Firestore display fields from that.
- Why: Firestore can contain stale verification fields after manual testing or old account state.
- Tradeoff: users may need to sign out/back in or refresh tokens during QA to see the newest Firebase Auth state.

## Keep Jobs Admin-Reviewed For Now

- What: new job posts use review/beta language; applications are beta records.
- Why: marketplace trust, payment responsibility, and abuse handling are not final.
- Tradeoff: less automation, but safer demo story.

## Delete Posted Jobs Through A Trusted Route

- What: posters can delete their own non-matched, non-completed jobs through a Firebase Admin-backed route.
- Why: cleanup should remove pending application records and close related threads without trusting client-only writes.
- Tradeoff: matched/completed jobs need explicit archive/cancel product rules before they can be removed safely.

## Use Participant-Based Job Messaging

- What: job application threads store poster/worker participant IDs and open for shortlisted or accepted applications.
- Why: messaging should follow the marketplace lifecycle instead of being a public/demo thread concept.
- Tradeoff: Firestore rules must be deployed and validated; moderation and notifications still need production hardening.

## Keep Message Sends Server-Backed

- What: participants send messages through a protected server route that verifies Firebase ID tokens and thread membership.
- Why: direct client writes are risky for private conversations and future moderation.
- Tradeoff: client-side realtime writes stay limited; Firestore rules still need participant-only read coverage.

## Use Completed Jobs For Skill Progress

- What: completing an accepted job increments the worker's `skillProgress` for the job's primary skill tag.
- Why: completed marketplace work should become the base for lightweight reputation.
- Tradeoff: skill levels are early signals only; anti-gaming, disputes, and payment verification are not solved yet.

## Do Not Add Stripe Yet

- What: payments are deferred.
- Why: ledger, verification, dispute, and marketplace responsibility need design first.
- Tradeoff: portfolio demo is less financially complete, but avoids unsafe payment claims.
