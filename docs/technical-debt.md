# Technical Debt

## Highest Risks

- Middleware trusts a client-set UID cookie. It is useful for routing, not real auth.
- Email verification is mostly client-gated; sensitive routes still need server verification.
- Firestore rules are starter rules and need validation before rollout.
- Money-like writes still exist in multiple helpers.
- `jobApplications` has beta applicant/poster/admin rules, but still needs emulator validation.
- `messageThreads` has signed-in demo reads only; private participant rules need schema/client changes.
- Messaging currently exposes a demo concept, not private production chat.

## Security Debt

- Add server-side checks for all money-affecting writes.
- Restrict verification, risk, balance, transaction, payout, and role fields.
- Add participant rules for `messageThreads`.
- Add participant IDs to `messageThreads` before enabling client writes.
- Keep applicant-owner/poster/admin rules for `jobApplications` validated against real flows.
- Add upload size limits and route consolidation.
- Avoid direct contact detail exposure in messaging.

## Architecture Debt

- Client Firestore usage is still broad.
- Admin panel is custom and growing messy.
- Firestore schema is implicit.
- No tests found.
- Lint has warnings for `<img>` and hook dependencies.
- README was still starter text before docs cleanup.

## Product Debt

- Jobs now have a beta poster review/status workflow, but not a production match/contract workflow.
- Job applications do not have an external CMS/admin operations workflow yet.
- Messaging is not connected to application lifecycle.
- Tasks still dominate product identity.
- Leaderboard currently uses wallet/balance total; confirm whether task rewards and future job earnings should stay combined. [VERIFY]

## Dependency Debt

- `npm audit --audit-level=moderate` previously found vulnerable dependencies. Re-run before production decisions.
- `baseline-browser-mapping` warning appears during lint/build.

## Priority Order

1. Keep build/lint passing.
2. Commit or otherwise checkpoint current local work.
3. Validate the poster review flow for `jobApplications`.
4. Validate Firestore rules for jobs/applications/messages with emulator coverage.
5. Move remaining money writes server-side.
6. Consolidate upload routes.
7. Add smoke tests for auth, jobs, leaderboard, avatar loading, admin review, uploads, and messaging.
