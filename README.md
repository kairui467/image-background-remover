# Image Background Remover

A free, fast, privacy-first online tool to remove image backgrounds — powered by [Remove.bg](https://www.remove.bg/).

## Features

- 🖼️ Drag & drop or click to upload (JPG, PNG, WebP)
- ⚡ Instant background removal via Remove.bg API
- 🔒 Images are never stored — processed in memory only
- 📥 Download result as PNG with transparency
- 📱 Mobile responsive

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **AI:** Remove.bg API
- **Deploy:** Cloudflare Pages

## Getting Started

1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your Remove.bg API key
4. Run: `npm run dev`

## Environment Variables

```
REMOVE_BG_API_KEY=your_api_key_here
```

Get a free API key at [remove.bg/api](https://www.remove.bg/api).

## Deploy to Cloudflare Pages

1. Connect your GitHub repo in Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `.next`
4. Add `REMOVE_BG_API_KEY` in environment variables
