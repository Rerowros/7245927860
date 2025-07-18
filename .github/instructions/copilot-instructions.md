# Copilot Instructions for AI Coding Agents

## Project Overview
- **Framework:** Next.js (App Router, TypeScript, bootstrapped with `create-next-app`).
- **App Structure:**
  - Main app code: `src/app/` (pages, layouts, API routes)
  - UI components: `src/components/`
  - Business logic & integrations: `src/lib/`
  - Database schema & migrations: `prisma/`
- **Database:**
  - Managed with Prisma (`prisma/schema.prisma`, `prisma/dev.db`)
  - All DB access via Prisma Client (`src/lib/prisma.ts`)

## Key Workflows
- **Development:**
  - Start dev server: `npm run dev` (http://localhost:3000)
- **Database:**
  - Edit schema: `prisma/schema.prisma`
  - Run migrations: `npx prisma migrate dev`
  - Use Prisma CLI for DB tasks
- **API Routes:**
  - Located in `src/app/api/` (RESTful endpoints)
  - Dynamic routes: `[param]` syntax (e.g., `orders/[id]/route.ts`)
- **Authentication:**
  - Admin login: `src/app/admin/login/page.tsx`

## Project Conventions
- **TypeScript only** (`.ts`, `.tsx`)
- **Next.js App Router**: file-based routing, layouts, server components
- **UI:** Shared components in `src/components/`
- **Business logic:** `src/lib/` (e.g., `telegram.ts` for Telegram integration)
- **No direct SQLite access**; always use Prisma
- **Secrets/config:** Use environment variables (not checked in)

## Integration Points
- **Telegram:** Logic in `src/lib/telegram.ts`, webhook at `src/app/api/telegram-webhook/route.ts`
- **Prisma:** All DB access via `src/lib/prisma.ts`
- **API:** Internal endpoints in `src/app/api/`

## Examples & Patterns
- **Admin page:** Add folder in `src/app/admin/` with `page.tsx`
- **API route:** Add folder/file in `src/app/api/` (see `orders/route.ts`)
- **DB schema update:** Edit `prisma/schema.prisma`, run Prisma CLI
- **Dynamic API route:** Use `[param]` in folder name (e.g., `user/[username]/route.ts`)

## References
- `README.md`: Setup & Next.js links
- `prisma/schema.prisma`: DB structure
- `src/lib/telegram.ts`: External integration example

---
If unsure about a pattern, follow the structure of existing files in the relevant directory. Prefer explicit, readable code and match the project's established conventions.
