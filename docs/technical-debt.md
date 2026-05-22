# Technical Debt

## Highest Risks

- Middleware trusts a client-set UID cookie. It is useful for routing, not real auth.
- Email verification is mostly client-gated; sensitive routes still need server verification.
- Firestore rules are starter rules and need validation before rollout.
- Money-like writes still exist in multiple helpers.
- `jobApplications` has applicant/poster/admin rules, but still needs emulator validation for the full lifecycle.
- `messageThreads` now stores participant IDs with participant-only read rules and server-backed sends, but still needs emulator validation.
- Messaging is closer to marketplace chat, but still needs moderation, abuse handling, and notification decisions.
- Message bubble alignment still needs a UI fix so each signed-in participant sees their own messages consistently.
- Global red-dot notification state does not exist yet for messages, jobs, or tasks.

## Security Debt

- Add server-side checks for all money-affecting writes.
- Restrict verification, risk, balance, transaction, payout, and role fields.
- Validate participant-only read rules for `messageThreads` and message subcollections in the emulator.
- Keep message writes server-backed; do not enable direct client writes unless rules can prove participant access.
- Validate applicant-owner/poster/admin rules for `jobApplications` against shortlist, accept, reject, and complete flows.
- Add upload size limits and route consolidation.
- Avoid direct contact detail exposure in messaging.

## Architecture Debt

- Client Firestore usage is still broad.
- Admin panel is custom and growing messy.
- Firestore schema is implicit.
- Shared marketplace lifecycle helpers have Node tests, but app-route and Firestore emulator coverage is still missing.
- Lint has warnings for `<img>` and hook dependencies.
- README was still starter text before docs cleanup.

## Product Debt

- Jobs now have a poster review/status workflow through completion, but not a production match/contract/payment workflow.
- Job applications do not have an external CMS/admin operations workflow yet.
- Messaging is connected to shortlisted/accepted applications, but not yet moderated or notification-ready.
- Manage posted jobs supports safe draft/open deletion, but matched/completed job deletion and archiving need product rules before production.
- The branded verification email template exists as HTML, but Firebase client `sendEmailVerification()` still uses Firebase's email system unless a custom mailer is added.
- Skill-tag progression exists for completed jobs; reputation display and anti-gaming rules are still early.
- Tasks still dominate product identity.
- Leaderboard currently uses wallet/balance total; confirm whether task rewards and future job earnings should stay combined. [VERIFY]

## Dependency Debt

- `npm audit --audit-level=moderate` previously found vulnerable dependencies. Re-run before production decisions.
- `baseline-browser-mapping` warning appears during lint/build.

## Priority Order

1. Keep build/lint passing.
2. Commit or otherwise checkpoint current local work.
3. Validate the full poster application lifecycle for `jobApplications`.
4. Harden and validate Firestore rules for jobs/applications/messages with emulator coverage.
5. Move remaining money writes server-side.
6. Consolidate upload routes.
7. Add smoke tests for auth, jobs, leaderboard, avatar loading, admin review, uploads, and messaging.
