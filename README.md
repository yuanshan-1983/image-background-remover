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

## Setup

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

## Notes

- Images are processed in-memory only.
- This MVP does not store uploads or results.
- For production, add rate limiting / Turnstile before launch.
