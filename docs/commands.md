# Commands

## Install

```bash
npm install
```

## Dev

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Start

```bash
npm run start
```

## Lint

```bash
npm run lint
```

## Tests

```bash
npm test
```

No Firebase emulator or Firestore rules test command found yet.

## Notes

- Dev and build scripts use webpack because the PWA config is not Turbopack-ready.
- Builds may need network access because `next/font` fetches Google font assets.
- `.env.example` lists safe env variable names.
- Do not read real `.env` files.
