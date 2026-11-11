# PROGRESS.md — HealthCapsule

Living status doc. The working agent updates this after every accepted task (see ~/.zcode/AGENTS.md §0b). Last updated: 2026-11-10.

## What this project is
HealthCapsule ("Capsule") — healthcare directory for Bangladesh: verified doctors, hospitals, diagnostic centers for patients (web), staff/admin panels for data collection, Expo app for staff. Monorepo: web/ (Next.js + Prisma/Neon + Supabase + Vercel), mobile/ (Expo).

## Current branch & commit state
- Branch: feat/i18n-dictionaries → MERGED TO MAIN + PUSHED 2026-11-10 (Talha-approved; ff to main; prod build PASS before push). District routing + Noakhali seed now on origin/main.
- Working tree after push: 5 real files committed; ~99 CRLF churn files restored to HEAD (not committed); untracked scratch (debug/scrape scripts, pnpm-lock.yaml) left out deliberately — line-ending normalization (.gitattributes) and scratch disposition still awaiting Talha's call.

## Shipped (dated log, newest first)
- 2026-11-11 — DistrictSwitcher UI fix: direct navigation to `/${slug}` on any district selection + `District.bnName` backfilled for 13 districts (Chattogram: চট্টগ্রাম, Noakhali: নোয়াখালী).
- 2026-11-10 — District routing + Noakhali data COMMITTED + PUSHED TO MAIN (4 commits): District.slug + Chamber.visitingInfo schema fields (db pushed); /[district] hub page (invalid slug → 404, empty → coming-soon + noindex); /api/v1/districts (only districts with live content); DistrictSwitcher pill in navbar (desktop + mobile, data-only dropdown, sets capsule_district cookie); Noakhali seeded to live DB (29 facilities / 331 doctors / 411 chambers, Chattogram untouched); en/bn.json 7 district.* keys each (809 parity). tsc/eslint/prod-build PASS.
- 2026-11-08 — Bangla made the DEFAULT locale + i18n feature COMMITTED on feat/i18n-dictionaries (5 commits, unpushed): DEFAULT_LOCALE="bn" in web/src/lib/i18n.ts; no-cookie first visit renders bn (verified via SSR html lang + hero text on /, /doctors, /healthcares, /login, /register); cookie'd users keep their choice; tsc/eslint clean.
- 2026-11-07 — i18n wave 1 COMPLETE: Google Translate removed; self-hosted web/src/i18n/en.json + bn.json (802 keys, exact parity); LanguageContext toggle (instant client flip + capsule_lang cookie + router.refresh); dynamic html lang; ALL public/admin/staff/forms/login strings wired; Bangla authored by translator agent in glossary chunks; 3 reviewer passes PASS; browser QA PASS (0 console errors, round-trip verified); visual QA PASS 375/768/1440 both locales; bonus latent-bug fix: admin doctor-edit facility preselect (chambers[0].facility.id).
- 2026-11-04 — Homepage redesign committed + pushed to main (e2c4592, 8880adc): full-bleed crossfade hero, navbar scroll transition, tightened vertical rhythm; clickable facility cards with branded placeholder covers.
- 2026-11-04 — Chattogram real-data import LIVE on main (d96a470: 27 facilities / 1,480 doctors); images: covers 17/27, logos 19/27 (332a511).
- 2026-11-03 — Stagger key-remount fix for param-driven lists on client nav (213d18e, /healthcares).

## In flight / awaiting decision
- Noakhali images pass: 47 staged files (FB + site harvests) → Supabase via storeImage → FacilityImage rows + logoUrl/coverImageUrl (Chattogram pattern) — next up
- Full district listings: /noakhali/doctors + /noakhali/healthcares with filters/pagination; homepage default-district filtering (cookie > geo hint > chattogram) — Slice 2
- 4 parked doctor name-pair merges (Naser/Nasser + Jahirul/Zahirul rec merge; Saif Uddin pair keep separate; Touhid pair pending) — Talha's call
- Line-ending normalization chore (.gitattributes to stop the recurring CRLF churn) + scratch-file disposition (leave / gitignore / delete) — Talha's call

## Planned next (approved plans only)
- District geo pages: /noakhali etc. hub shipped 2026-11-10; remaining: full listings, homepage default filtering, geo hint — data done for Noakhali
- Anti-scraping layers (robots.ts, UA block, Cloudflare, rate limits, click-to-reveal phones) — designed 2026-11-04, nothing implemented — 0%
- i18n wave 2: in-panel language switcher for admin/staff + login, SEO metadata, API error messages, mobile app i18n — 0%
- Dhaka dataset (big data job) — 0%

## Area status (rough completion)
| Area | State |
|---|---|
| Public site (web) | Core pages done; homepage redesigned; en/bn toggle live |
| Admin/staff panel (web) | Functional; fully i18n'd; staff CRUD incl. edit |
| Data: Chattogram | LIVE (27 facilities / 1,480 doctors); covers 17/27, logos 19/27 |
| Data: Noakhali | LIVE (29 facilities / 331 doctors); district routing shipped; images pass pending (47 staged) |
| Data: Dhaka / other divisions | Not started |
| i18n (web) | Wave 1 complete; wave 2 pending |
| Mobile app | Functional; English only, no i18n |
| Anti-scraping | Design only |
