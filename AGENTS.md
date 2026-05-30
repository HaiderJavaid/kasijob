# AGENTS.md

## Start Here

- Read this file first.
- Read `docs/HANDOFF.yaml` for latest repo state and pending work.
- Read `agents/workflow.md` before changing code or docs.
- Read `agents/tasks.md` for current priorities.
- Read `docs/architecture.md` before touching app, API, auth, storage, admin, jobs, or money-like flows.
- Read `docs/roadmap.md` before product work.
- Read `docs/technical-debt.md` before security, payment, payout, or production-readiness work.
- Use `agents/roles.md` to choose the right working mode.

## Project Snapshot

- Name: KasiJobs in code. `KasiJob` vs `KasiJobs` still needs final product naming. [VERIFY]
- Goal: move from a task/reward prototype into a jobs-first marketplace for small paid work.
- Stack: Next.js App Router, React, JavaScript, Tailwind CSS, Firebase Auth, Firestore, Firebase Admin SDK, Cloudflare R2, PWA setup.
- Current state: portfolio/demo MVP in progress. Task rewards are more complete than jobs; jobs and messaging are beta/demo flows.

## Important Rules

- Do not read real `.env` files.
- Use `.env.example` for safe env names.
- The worktree may already be dirty. Do not revert changes you did not make.
- Keep docs short and high-signal.
- Update `agents/tasks.md` when task status changes.
- Update `docs/decisions.md` only when a meaningful technical/product decision is made.
- Be careful with auth, uploads, balances, transactions, referrals, payouts, admin actions, jobs, and messaging.
- Do not add Stripe, escrow, or real payout automation until trust, ledger, rules, and marketplace flow are clearer.

## Default Workflow

1. Understand the request.
2. Read only the docs needed for the task.
3. Inspect the real code before changing it.
4. Make the smallest useful change.
5. Run the right checks from `docs/commands.md`.
6. Update docs if the project state changed.
7. Report what changed, what was verified, and what remains.

## Key Docs

- `docs/HANDOFF.yaml` — latest session state, dirty worktree notes, verification, and next steps.
- `docs/overview.md` — product, users, features, current state.
- `docs/architecture.md` — stack, folders, data flow, services.
- `docs/roadmap.md` — phased product plan.
- `docs/technical-debt.md` — risks and cleanup priorities.
- `docs/commands.md` — exact repo commands.
- `docs/decisions.md` — important decisions already visible.
- `docs/portfolio-summary.md` — public/resume-friendly project summary.
- `agents/workflow.md` — AI working rules for this repo.
- `agents/tasks.md` — current work list.
- `agents/roles.md` — simple AI staff roles.
