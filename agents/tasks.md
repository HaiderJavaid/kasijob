# Tasks

## Current Priority

- Validate the jobs-first marketplace loop manually against a real Firebase project.
- Cover post job, apply, poster review, applicant status, leaderboard, and avatar loading.

## Next

- Test email verification with a real Firebase user.
- Decide who can submit beta jobs. [VERIFY]
- Decide when a job application creates or attaches to a message thread. [VERIFY]
- Validate Firestore rules for `jobs`, `jobApplications`, and `messageThreads` in the emulator.
- Manually test poster application status updates against a real Firebase project.
- Add participant IDs or a server route before enabling client writes to `messageThreads`.
- Consolidate `/api/upload` and `/api/r2`.
- Move remaining money-like client writes behind server routes.
- Add smoke tests or a manual QA checklist.
- Confirm leaderboard should include task rewards plus future job earnings through the same wallet/balance total. [VERIFY]

## Roadmap Tasks

- Shift product identity toward jobs-first.
- Keep tasks as temporary acquisition or secondary earning surface. [VERIFY]
- Rework leaderboard around verified earnings. [VERIFY]
- Add messaging moderation and participant rules.
- Design ledger/payment model before Stripe.

## Technical Debt

- Middleware cookie is not strong auth.
- Firestore rules are not validated.
- No tests found.
- Admin panel is custom and getting large.
- Several docs and files may still be uncommitted.
- Dependency audit previously showed vulnerabilities. Re-run before release.

## Done

- AI docs reorganized into `docs/` and `agents/`.
- Phase 0 stabilization docs captured.
- Security foundation docs captured.
- Email verification MVP docs captured.
- Jobs beta flow docs captured.
- Messaging demo docs captured.
- Portfolio summary cleaned for public use.
- Beta Firestore rules added for `jobApplications`, including poster status updates, and demo `messageThreads` reads.
- Jobs marketplace loop added with poster review and applicant status routes.
- Runtime bug triage: fixed job posting `id: undefined` Firestore error, restored legacy leaderboard users without `emailVerified`, and made avatar loading fall back cleanly when protected R2 URL refresh fails.
