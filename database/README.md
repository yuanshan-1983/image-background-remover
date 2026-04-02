# D1 Database Setup

## Files

- `schema.sql` — initial schema for Auth.js + Google OAuth + D1

## Create a D1 database

```bash
npx wrangler d1 create image-background-remover-db
```

After creation, Cloudflare will return a `database_id`.

## Bind D1 in `wrangler.toml`

Add:

```toml
[[d1_databases]]
binding = "DB"
database_name = "image-background-remover-db"
database_id = "YOUR_D1_DATABASE_ID"
```

## Initialize schema

```bash
npx wrangler d1 execute image-background-remover-db --file=./database/schema.sql
```

## Local D1 preview

For local development, you can use Wrangler's local D1 support:

```bash
npx wrangler dev
```

## Next steps

- Add Auth.js adapter methods backed by D1
- Add Google OAuth secrets
- Protect `/api/remove-background` behind session checks
- Add usage limits with `usage_daily`
