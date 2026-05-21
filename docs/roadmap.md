# Roadmap

## Phase 0: Stabilize Demo

- Keep lint/build passing.
- Keep `.env.example` current.
- Avoid broken demo routes.
- Commit current local work once reviewed.

## Phase 1: Trust Foundation

- Test email verification with a real Firebase project.
- Move remaining money-affecting writes behind server routes.
- Validate Firestore rules against real app flows, especially jobs, applications, and message thread reads.
- Consolidate duplicate upload routes.

## Phase 2: Jobs-First Marketplace

- Keep the poster application lifecycle working: applied/interested, shortlisted, accepted, rejected, completed.
- Keep status updates server-backed and visible to both worker and poster.
- Keep completed jobs feeding worker skill-tag progression.
- Decide who can post jobs: admin only, invited clients, or all verified users. [VERIFY]

## Phase 3: Messaging

- Keep direct poster-worker threads tied to shortlisted/accepted applications.
- Keep message sends server-backed and participant-checked.
- Add participant-only Firestore read rules and message subcollection rules.
- Add moderation visibility for admins.

## Phase 4: Payments And Payouts

- Design ledger before adding Stripe.
- Decide payment model: client deposit, wallet, manual settlement, Stripe Connect, or another flow. [VERIFY]
- Add payout holds, reversal states, dispute flow, and audit trail.
- Add phone verification/manual review for higher-risk money actions.

## Phase 5: Portfolio Polish

- Make the jobs flow smooth enough to demo end to end.
- Keep public summary confident.
- Keep internal docs honest about production risk.
- Decide whether tasks stay visible or become secondary.

## Next Recommended Feature

- Add a manual QA checklist for the jobs marketplace loop.
- It should cover post job, apply, shortlist, accept, reject, complete, message send, skill progress, and current demo-safe limits.
