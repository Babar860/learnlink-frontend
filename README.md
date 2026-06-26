# LearnLink Frontend

Next.js 14 App Router UI for the LearnLink home feed, courses, jobs, community, and admin entry points.

## Run

```bash
npm install
npm run dev
```

Default port: `3000`.

## Environment

Copy `.env.example` to `.env.local` for local development and set these in Vercel project settings for deployment:

- `NEXT_PUBLIC_GATEWAY_URL`
- `NEXT_PUBLIC_COMMUNITY_SERVICE_URL`
- `NEXT_PUBLIC_COURSES_SERVICE_URL`
- `NEXT_PUBLIC_JOBS_SERVICE_URL`

The current UI can render without these values because it uses static scaffold data, but production API wiring should point them at the deployed backend services.

## Vercel

This repository includes `vercel.json` with Next.js build settings. Deploy as a preview first:

```bash
npx vercel deploy . -y
```
