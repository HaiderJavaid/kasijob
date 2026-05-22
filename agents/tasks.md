# Tasks

## Current Priority

- Final manual QA of the jobs-first marketplace loop against the real Firebase project.
- Cover post job, apply, shortlist, accept, reject, complete, messaging, skill progress, leaderboard, avatar loading, and job deletion.

## Next

- Fix message bubble alignment in job application threads: the poster's own messages should render as "mine" for the poster, and the worker's own messages should render as "mine" for the worker.
- Design a global notification/red-dot system for messages, jobs, and tasks. It should surface in bottom navigation and on relevant cards or page sections.
- Track unread message state per participant, then mark a thread read when the current participant opens it.
- Add job/application notification state for new applicants, status changes, and newly open conversations. [VERIFY scope]
- Test email verification with a real Firebase user.
- Decide who can submit beta jobs. [VERIFY]
- Validate Firestore rules for `jobs`, `jobApplications`, `messageThreads`, and message subcollections in the emulator.
- Manually test poster application status updates and message sends against a real Firebase project.
- Validate the participant inbox query against real Firebase data without relying on sample threads.
- Consolidate `/api/upload` and `/api/r2`.
- Move remaining money-like client writes behind server routes.
- Add smoke tests or a manual QA checklist.
- Confirm leaderboard should include task rewards plus future job earnings through the same wallet/balance total. [VERIFY]

## Roadmap Tasks

- Shift product identity toward jobs-first.
- Keep tasks as temporary acquisition or secondary earning surface. [VERIFY]
- Rework leaderboard around verified earnings. [VERIFY]
- Add messaging moderation, notifications, and emulator rule coverage.
- Design ledger/payment model before Stripe.

## Technical Debt

- Middleware cookie is not strong auth.
- Firestore rules are not validated.
- Marketplace helper tests exist; route and emulator tests are still missing.
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
- Marketplace vertical slice updated with server-backed shortlist/accept/reject/complete, participant-based message threads, server-backed message sends, and completed-job skill progression.
- Participant-only message thread rules added for the Firebase messaging slice.
- Marketplace cleanup pass removed job sample fallbacks, moved Messages into bottom navigation, restored wallet-first profile layout, and relaxed avatar viewing for public profile images.
- Manage posted jobs now lists jobs first, expands applicants per job, blocks self-review actions, and supports safe deletion for jobs that are not matched or completed.
- Firebase Admin local configuration was fixed with explicit project diagnostics and a dev-only auth debug endpoint.
- Email verification now treats Firebase Auth as the source of truth instead of trusting stale Firestore fields.
- A branded HTML email verification template was added for a future custom mailer path.
