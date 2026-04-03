# Custom Google OAuth + D1

This project now uses a custom authentication flow instead of NextAuth.

## Current auth flow

- `/api/auth/google/start` starts Google OAuth
- `/api/auth/google/callback` exchanges the code and writes the user/session into D1
- `/api/auth/logout` clears the session cookie
- `/api/me` returns the current signed-in user based on the D1-backed session cookie

## Session storage

- App session records are stored in the `sessions` table in D1
- The browser receives a signed `imd_session` cookie

## Next implementation steps

1. Verify Google login writes users/accounts/sessions into remote D1
2. Add nicer account UI
3. Keep usage limits backed by `usage_daily`
