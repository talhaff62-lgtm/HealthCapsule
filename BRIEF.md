# BRIEF.md — HealthCapsule Web Design

## Business & difference
HealthCapsule is a healthcare directory for Bangladesh: verified doctors, hospitals/diagnostics, health videos, and a health blog. Difference: verified, Bangladesh-local (areas/thanas), made in Chattogram.

## Audience & devices
Patients (mobile-first), doctors, and hospitals/clinics. Majority of traffic is Android/mobile; desktop is secondary.

## Primary goal
One action: search and find a doctor or facility (hero search).

## Brand personality
IS: trustworthy, calm, modern-clean. NOT: corporate-stiff, dark-techy, playful-cartoon.

## References
- sword.com (analyzed 2026-10-20): floating glass navbar, large rounded section canvases, soft shadows, pill CTAs, serif+sans pairing. Take: structure, shape language, navbar.
- brand-assets/healthcapsule-2030-v3.html (Talha's reference): light #F2F6FC base, teal accent, glass nav, aurora blobs, gradient text. Take: energy and accents only — do not copy its layout wholesale.

## Asset inventory
web/public/images/: logo.png, no_bgLogo.png, hero-doctor.svg, how_it_works.png, problem_today.png. brand-assets/capsule_logo.jpg. Photos of doctors/facilities come from the DB (Supabase bucket).

## Pages/sections (homepage)
Hero(search) → Stats → FeaturedDoctors → Videos → FeaturedHospitals → Blog → HowItWorks → Why → Audiences → Trust → CTA. Navbar + Footer global.

## Constraints
Next.js App Router + Tailwind 4 + Prisma; no new npm dependencies; no new fonts (reuse Fraunces/Inter/IBM Plex Mono); content is plain text; mobile-first (375px must be clean); deploy on Vercel.

## Motion level
Subtle: hover transitions, one gentle float in hero, soft aurora drift in hero background. All decorative motion off under prefers-reduced-motion.

## Done means
Homepage at 375/768/1440 shows the stacked rounded-canvas layout with floating glass navbar; no horizontal overflow; all existing data sections still render; typecheck and lint pass.
