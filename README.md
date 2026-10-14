# Oceanic Study Library — Render-ready source

This folder is a standalone React + TypeScript + Vite website package. It does
not depend on the Replit workspace or its monorepo packages.

## Push this folder to GitHub

Create a repository, then upload the **contents** of this folder to the
repository root. Keep `render.yaml`, `package.json`, `src/`, and `public/`
together.

## Deploy on Render

Create a **Static Site** from that GitHub repository. Render can use the
included `render.yaml`. If entering settings manually, use:

- Build command: `npm install && npm run build`
- Publish directory: `dist`

No environment variables are required. The included rewrite keeps app routes
such as `/students` working after refresh.

## Run locally

Use Node.js 20.19+ or 22.12+:

```sh
npm install
npm run dev
```

This version uses browser-side demonstration data; changes are not shared
between users or saved to a database.
