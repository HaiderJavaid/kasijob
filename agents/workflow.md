# Agent Workflow

## Read Order

- Start with `AGENTS.md`.
- Read `docs/HANDOFF.yaml` for the current session handoff.
- Read `agents/tasks.md` for current priorities.
- Read `docs/architecture.md` before code changes.
- Read `docs/technical-debt.md` before security, money, upload, auth, or messaging work.
- Read `docs/roadmap.md` before product direction changes.

## Working Rules

- Inspect real code before changing docs or implementation.
- Keep changes small unless the task clearly needs more.
- Preserve existing patterns unless there is a clear reason to change them.
- Do not read real `.env` files.
- Do not revert dirty worktree changes you did not make.
- Update docs only when they help the next human or agent.

## Verification

- Use `npm run lint` after JS/React changes.
- Use `npm run build` after route, config, API, or dependency changes.
- There are no test scripts yet.
- Report warnings honestly.

## Documentation Rules

- Keep docs short.
- Prefer current facts over history.
- Mark uncertain claims with `[VERIFY]`.
- Remove duplicate notes instead of copying them around.
- Public portfolio wording belongs in `docs/portfolio-summary.md`.
- Internal risk and debt belongs in `docs/technical-debt.md` or `agents/tasks.md`.

## When Done

- Summarize what changed.
- Say what was verified.
- Note what remains risky or unfinished.
- Update `agents/tasks.md` if priorities changed.
