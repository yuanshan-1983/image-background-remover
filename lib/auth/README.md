# Auth.js + D1 Skeleton

This folder contains the initial authentication scaffolding for:

- Auth.js
- Google OAuth
- Cloudflare D1

## Current state

- `options.ts` wires Google OAuth when env vars are present
- the official `@auth/d1-adapter` is enabled when the Cloudflare `DB` binding exists
- `d1.ts` contains starter helper functions for future custom logic / usage bookkeeping
- `/api/me` can now be used as a lightweight auth status check
- remover API protection is still not enabled yet

## Next implementation steps

1. Verify first login writes users / accounts / sessions into remote D1
2. Protect `/api/remove-background`
3. Add usage checks with `usage_daily`
4. Add logout / account menu UI
