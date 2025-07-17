# Copilot Instructions for This Codebase

## Overview
- This is a [Next.js](https://nextjs.org) project using the `/app` directory structure, bootstrapped with `create-next-app`.
- The main entry point is `src/app/page.tsx`. Global layout and styles are in `src/app/layout.tsx` and `src/app/globals.css`.
- Components are located in `src/components/` (e.g., `PurchaseModal.tsx`).
- Static assets (SVGs, images) are in the `public/` directory.

## Developer Workflows
- **Start development server:**
  - `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`)
  - App runs at [http://localhost:3000](http://localhost:3000)
- **Edit pages:**
  - Main page: `src/app/page.tsx`
  - About page: `src/app/about/page.tsx`
  - Layout: `src/app/layout.tsx`
- **Global styles:**
  - `src/app/globals.css`
- **Configuration:**
  - Next.js: `next.config.ts`
  - TypeScript: `tsconfig.json`
  - ESLint: `eslint.config.mjs`
  - PostCSS: `postcss.config.mjs`

## Project Conventions
- Use the `/app` directory for routing and layouts (Next.js App Router).
- Place reusable UI in `src/components/`.
- Use TypeScript for all code (`.tsx`, `.ts`).
- Static files (SVGs, images) go in `public/` and are referenced with `/file.svg` paths.
- Font optimization is handled via `next/font` (see README for details).

## Patterns & Examples
- Pages are colocated in `src/app/` by route (e.g., `about/page.tsx` for `/about`).
- Modals and UI widgets are in `src/components/` (see `PurchaseModal.tsx`).
- Global styles are imported in `layout.tsx`.

## External Integrations
- No custom backend or API integration is present by default.
- Deployment is intended for Vercel (see README for details).

## References
- See `README.md` for more getting started and deployment info.
- For Next.js conventions, refer to [Next.js Documentation](https://nextjs.org/docs).
