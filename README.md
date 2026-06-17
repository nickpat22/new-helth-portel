# UDHRS Health Portal

This is a Vite + React project with Supabase integration.

## Setup

1. Copy `.env.example` to `.env`
2. Set your Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Install dependencies:
   - `npm install`
4. Run locally:
   - `npm run dev`

## Vercel Deployment

1. Push this repo to GitHub.
2. Connect the GitHub repo to Vercel.
3. Set environment variables in Vercel using the same keys as `.env`.
4. Build command: `npm run build`
5. Output directory: `dist`
