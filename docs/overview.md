# Overview

## What KasiJobs Is

- KasiJobs is a mobile-first earning platform.
- It started with task rewards to get early users.
- The product direction is now jobs-first: small paid jobs, applications, review, matching, and worker-poster communication.
- The current app is best treated as a portfolio/demo MVP, not a live financial marketplace.

## Users

- Earners: browse tasks/jobs, submit proof, apply for jobs, track rewards.
- Job posters: submit beta job listings for review. [VERIFY long-term access model]
- Admins: review tasks, submissions, users, referrals, job posts, and money-like records.

## Current Feature State

- Auth: Firebase email/password login and registration.
- Verification: email verification gate exists for protected app flows.
- Tasks: task listing, proof submission, admin review, and reward crediting are the most complete workflow.
- Jobs: listing, detail, post-for-review, apply/register-interest, poster review, and applicant status flows exist.
- Messaging: lightweight demo threads exist under `/messages`; not production chat.
- Uploads: R2 signed uploads for avatars/proofs use server routes with Firebase ID token checks.
- Leaderboard: ranks wallet balance for now, including task rewards and future job earnings. [VERIFY]
- Admin: custom admin area exists for tasks, reviews, users, transactions, referrals, and tree view.
- Payments: Stripe, escrow, and real payouts are not implemented.

## Product Direction

- Jobs should become the main earning surface.
- Tasks can stay as a temporary acquisition/reward tool until the marketplace is stronger.
- Leaderboard should keep task income small but combine task and job income into one wallet ranking. [VERIFY]
- Admin review should stay in the loop until trust, abuse handling, and payment responsibility are clear.

## Naming

- Code and UI mostly use `KasiJobs`.
- Final name `KasiJob` vs `KasiJobs` is still open. [VERIFY]
