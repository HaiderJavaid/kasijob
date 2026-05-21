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

## Keep Jobs Admin-Reviewed For Now

- What: new job posts use review/beta language; applications are beta records.
- Why: marketplace trust, payment responsibility, and abuse handling are not final.
- Tradeoff: less automation, but safer demo story.

## Keep Messaging Lightweight For Demo

- What: `messageThreads` supports a simple portfolio/demo conversation flow.
- Why: the app needs a marketplace communication concept without pretending production chat is solved.
- Tradeoff: real messaging still needs rules, moderation, notifications, and lifecycle decisions.

## Keep Message Thread Writes Admin-Only

- What: Firestore rules allow signed-in demo reads for `messageThreads`, but client writes stay admin-only.
- Why: thread documents do not yet store participant IDs, so rules cannot prove who may append messages.
- Tradeoff: Firestore-backed replies may fail until messaging gets a participant schema or server route.

## Do Not Add Stripe Yet

- What: payments are deferred.
- Why: ledger, verification, dispute, and marketplace responsibility need design first.
- Tradeoff: portfolio demo is less financially complete, but avoids unsafe payment claims.
