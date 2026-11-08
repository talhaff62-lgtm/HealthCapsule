# Capsule Agent Instructions

**What this project is:** HealthCapsule ("Capsule") is a healthcare directory for Bangladesh — verified doctors, hospitals and diagnostic centers that patients browse on the web, with staff/admin panels for data collection and review, and an Expo app for staff on the go. Monorepo: `web/` (Next.js App Router + TypeScript + Tailwind + Prisma on Neon Postgres, Supabase storage, deployed on Vercel) and `mobile/` (Expo). Most work happens in `web/`.

## Docs map — read what you need, keep it current
- **What this project is + coding conventions** → this file
- **Intent, audience, goals, assets** → `BRIEF.md`
- **Design decisions, tokens, motion rules** → `DESIGN.md`
- **Current plan, in-flight work, progress & shipped log** → `PROGRESS.md` — update it after every accepted task (orchestration protocol: `~/.zcode/AGENTS.md`; repo/package names still healthcapsule-app — do not rename identifiers.)

## Structure & Deployment

- Monorepo: `web/` = Next.js App Router + TypeScript + Tailwind + Prisma; `mobile/` = Expo. Most work happens in web/.
- Database: Neon Postgres. Schema at web/prisma/schema.prisma. All models use `id String @id @default(cuid())`, `createdAt`/`updatedAt`, optional `deletedAt DateTime?` for soft deletes.
- Images/uploads: Supabase bucket "healthcapsule" via `storeImage` from web/src/lib/storage/supabase-storage.ts.
- Deployment: Vercel with Root Directory = "web" (dashboard-only setting, invisible in repo). Mobile builds via EAS.

## Commands

Run from web/ unless noted.

- Dev: `npm run dev`
- Typecheck: `npx tsc --noEmit`
- Lint: `npx eslint <files>` (repo has ~8 pre-existing errors in doctor-form.tsx, LanguageSwitcher.tsx, seed files — ignore them in unrelated PRs)
- Schema changes: `npx prisma db push` then `npx prisma generate` — NEVER `prisma migrate dev` (DB has migration drift; db push is the sanctioned workflow)
- Seeding: `npm run seed:excel` (200 facilities/1000 doctors), `npm run seed:demo` (demo admin/staff panel users), `npm run seed:panel` — all under web/prisma/. tsx scripts need `import "dotenv/config"`

## Code Conventions

- Prisma singleton: `import { prisma } from "@/lib/prisma"`
- API routes under web/src/app/api/v1/. Admin routes must call `requireAuth(request, [UserRole.ADMIN])` or `[UserRole.STAFF, UserRole.ADMIN]` from "@/lib/api-guard". Zod validates all input. Shared schemas in lib files (e.g. web/src/lib/admin-content.ts).
- Slug generation: `generateUniqueSlug` from web/src/lib/slug.ts (handles -2/-3 suffixing).
- Admin CRUD UI: list page + new/[id] edit pages under web/src/app/admin/<resource>/. Shared form component in web/src/components/admin/ via `mode` + `initialValues` props. Admin nav links in web/src/components/panel/admin-shell.tsx.
- Public listing/detail pages are server components fetching prisma directly. Pagination mirrors doctors listing (?page= param).
- Content rendering is PLAIN TEXT (split paragraphs on blank lines). NEVER add HTML sanitizers — isomorphic-dompurify/jsdom breaks Vercel serverless (caused production 500; both uninstalled).
- Homepage sections in web/src/components/home/. Render null when data is empty. Order in web/src/app/page.tsx: Hero → StatsBar → FeaturedDoctors → VideosSection → FeaturedHospitals → BlogSection → HowItWorks → WhySection → Audiences → TrustSection → CtaBanner.
- Navbar public links: web/src/components/layout/Navbar.tsx (publicLinks array).
- Videos are YouTube embeds only (paste URL, server parses 11-char ID, render youtube-nocookie iframe). No raw video uploads.
- NO new npm dependencies without explicit approval. Prefer zero-dependency alternative and state that in the plan.
- No hand-editing lockfiles; regenerate with npm. Windows npm can cause package-lock drift that silently fails Vercel builds — re-derive lockfile after Windows-side npm changes.

## Gotchas

- Windows dev server: after stop, stale node child can keep port bound and fake 500 errors. Kill port owner before debugging.
- Git: work on feature branches. NEVER commit or push without explicit approval. No force-push.
