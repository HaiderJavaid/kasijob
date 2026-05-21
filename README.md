# KasiJobs

KasiJobs is a mobile-first earning platform moving toward a jobs-first marketplace for small paid work.

The app currently includes task rewards, proof submission, admin review, email verification, beta job posting, job applications, lightweight messaging, referral tooling, R2 uploads, and Firebase-backed data flows.

## Stack

- Next.js App Router
- React
- JavaScript
- Tailwind CSS
- Firebase Auth
- Firestore
- Firebase Admin SDK
- Cloudflare R2
- PWA setup

## Local Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Docs

- Start with `AGENTS.md`.
- Product and architecture docs live in `docs/`.
- AI workflow and task docs live in `agents/`.

## Safety Notes

- Do not read real `.env` files.
- Use `.env.example` for safe env names.
- This is a portfolio/demo MVP, not a live financial marketplace.
- Do not add payment flows until trust, ledger, rules, and payout decisions are clear.
