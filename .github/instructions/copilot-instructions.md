# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a Next.js project (App Router, TypeScript) bootstrapped with `create-next-app`.
- Main app code is in `src/app/` (pages, layouts, API routes).
- UI components are in `src/components/`.
- Business logic and integrations (e.g., Telegram) are in `src/lib/`.
- Database schema and migrations are managed with Prisma (`prisma/schema.prisma`, `prisma/dev.db`).

## Key Workflows
- **Development:**
  - Start dev server: `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`)
  - App runs at http://localhost:3000
- **Database:**
  - Prisma schema: `prisma/schema.prisma`
  - Local DB: `prisma/dev.db`
  - Use Prisma CLI for migrations and introspection
- **API Routes:**
  - Located in `src/app/api/` (RESTful endpoints, e.g., `orders`, `webhook`)
  - Dynamic routes use `[param]` syntax (see `orders/[id]/route.ts`)

## Project Conventions
- Use TypeScript for all code (`.ts`, `.tsx`).
- Use Next.js App Router conventions (file-based routing, layouts, server components).
- Place shared UI in `src/components/`.
- Place business logic and integrations in `src/lib/`.
- Use Prisma for all DB access; do not access SQLite directly.
- Use environment variables for secrets and config (not checked in).

## Integration Points
- **Telegram:** Integration logic in `src/lib/telegram.ts`.
- **Prisma:** All DB access via Prisma Client.
- **API:** Internal API endpoints in `src/app/api/`.

## Examples
- To add a new admin page: create a folder in `src/app/admin/` with a `page.tsx` file.
- To add a new API route: add a folder/file in `src/app/api/` (see `orders/route.ts`).
- To update DB schema: edit `prisma/schema.prisma` and run Prisma CLI.

## References
- See `README.md` for basic setup and Next.js links.
- See `prisma/schema.prisma` for DB structure.
- See `src/lib/telegram.ts` for external integration example.

---
If you are unsure about a pattern or workflow, prefer following the structure of existing files in the relevant directory.
