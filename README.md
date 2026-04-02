# Image Background Remover

Next.js + Tailwind CSS MVP for removing image backgrounds with the Remove.bg API.

## Features

- Upload JPG / PNG / WEBP images
- Max file size validation (default 10MB)
- No local image storage
- Calls Remove.bg server-side
- Returns transparent PNG for preview + download
- Friendly error handling
- Tailwind landing page UI
- Cloudflare-compatible deployment via OpenNext + Wrangler

## Local setup

```bash
npm install
cp .env.example .env.local
```

Set the environment variable:

```bash
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
MAX_FILE_SIZE_MB=10
```

## Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Cloudflare local preview

Create a local Worker env file:

```bash
cp .dev.vars.example .dev.vars
```

Then set:

```bash
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
MAX_FILE_SIZE_MB=10
```

Run Cloudflare preview:

```bash
npm run cf:preview
```

## Cloudflare deploy

Build the Cloudflare bundle:

```bash
npm run cf:build
```

Deploy with Wrangler:

```bash
npm run cf:deploy
```

## Cloudflare Pages / Git integration notes

This project is prepared for Cloudflare-compatible deployment using OpenNext and Wrangler.
For Git-based deployment, make sure the following are configured in Cloudflare:

- Build command: `npm run cf:build`
- Build output directory: `.open-next/assets`
- Environment variable: `REMOVE_BG_API_KEY`
- Environment variable: `MAX_FILE_SIZE_MB=10`
- Node compatibility enabled through `wrangler.toml`

## Notes

- Images are processed in-memory only.
- This MVP does not store uploads or results.
- For production, add rate limiting / Turnstile before launch.
