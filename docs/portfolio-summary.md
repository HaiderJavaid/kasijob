# Portfolio Summary

## Short Version

KasiJobs is a full-stack marketplace showcase for small jobs and earning opportunities in Malaysia. It combines job discovery, task rewards, proof submission, admin review, uploads, wallet-style tracking, email verification, and lightweight job messaging in a mobile-first web app.

## Resume Version

Built KasiJobs, a marketplace-style earning platform using Next.js App Router, React, Tailwind CSS, Firebase Auth, Firestore, Firebase Admin SDK, Cloudflare R2, and protected server routes. Delivered user flows for onboarding, task discovery, proof submission, beta job posting, applications, lightweight messaging, admin review, referral operations, and reward tracking.

## Features To Mention

- Firebase email/password auth and email verification gate.
- Task listing, proof upload, and admin approval/rejection.
- Wallet-style balance and transaction history.
- Jobs listing, job detail, post-for-review, and apply/register-interest flow.
- Lightweight job discussion threads.
- Custom admin tools for tasks, submissions, users, transactions, referrals, and tree view.
- R2 signed uploads for avatars and proof images.
- Server-side checks for protected uploads, postbacks, and several admin mutations.

## Interview Angle

- The project shows product judgment: start with a controlled earning flow, then evolve toward jobs marketplace behavior.
- The backend story is Firebase plus Next.js API routes, with newer trusted operations moved to Firebase Admin helpers.
- The security story is practical: admin review, verification, signed uploads, postback hardening, and server route boundaries.

## Avoid Saying

- Do not claim Stripe, escrow, real payouts, or production chat are implemented.
- Do not claim the app is ready for real money.
- Do not claim all Firestore writes are server-controlled.
