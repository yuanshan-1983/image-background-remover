# Auth.js + D1 Skeleton

This folder contains the initial authentication scaffolding for:

- Auth.js
- Google OAuth
- Cloudflare D1

## Current state

- `options.ts` provides a safe Auth.js config skeleton
- `d1.ts` contains starter D1 helper functions for users / accounts / sessions
- OAuth credentials are not wired yet
- The project still uses open access for the remover API until auth enforcement is added

## Next implementation steps

1. Add Google OAuth secrets to Cloudflare / local env
2. Replace JWT session placeholder with full D1-backed adapter logic
3. Protect `/api/remove-background`
4. Persist first-login user records into D1
