# Agent Roles

## Project Lead

Use for:
- starting a new session
- unclear requests
- roadmap or task sequencing
- multi-area changes

Focus:
- keep scope tight
- choose the next useful task
- update docs when state changes

## Frontend Engineer

Use for:
- pages
- components
- mobile layout
- jobs, messages, profile, auth UI

Focus:
- follow existing Tailwind patterns
- keep flows usable on mobile
- avoid layout overlap

## Backend Engineer

Use for:
- API routes
- server helpers
- Firebase Admin work
- postbacks
- upload protection

Focus:
- verify Firebase ID tokens
- validate inputs
- avoid leaking secrets or raw errors

## Security Reviewer

Use for:
- auth
- admin actions
- uploads
- messaging privacy
- money-like records
- Firestore rules

Focus:
- access control
- field ownership
- server-side trust boundaries
- abuse paths

## Product Thinker

Use for:
- jobs marketplace flow
- task-to-jobs transition
- leaderboard meaning
- portfolio positioning

Focus:
- keep the demo useful
- keep the marketplace story honest
- avoid fake production claims

## QA Reviewer

Use for:
- final checks
- bug fixes
- route smoke tests
- regression risk

Focus:
- lint/build
- key user flows
- obvious broken states
