# Auth.js + D1 Skeleton

This folder contains the initial authentication scaffolding for:

- Auth.js
- Google OAuth
- Cloudflare D1

## Current state

- `options.ts` now wires Google OAuth when env vars are present
- `d1.ts` contains starter D1 helper functions for users / accounts / sessions
- The current session strategy is still JWT as an intermediate step
- The project still uses open access for the remover API until auth enforcement is added

## Next implementation steps

1. Replace JWT session placeholder with full D1-backed adapter logic
2. Persist first-login user records into D1
3. Protect `/api/remove-background`
4. Add usage checks with `usage_daily`
