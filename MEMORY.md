# HealthCapsule — Project Memory

Last updated: 2026-07-13

## Current State

HealthCapsule has completed a premium visual UI/UX overhaul matching the Chattogram-focused brand identity (premium navy, cream, and gold palette). The homepage has been redesigned to be fully descriptive, containing detailed sections for patients, doctors, and hospitals, alongside interactive toolsets.

### Completed Features

- **Interactive Search Hero:** Multi-tab search card for Doctors, Hospitals, Ambulance dispatch, Blood donors, and an **AI Symptom Check** routing assistant.
- **Dynamic Stats Bar:** Displays real-time database counts of verified doctors, hospital listings, specialties, and covered areas.
- **Descriptive Sections:** Before-vs-After comparison grid, 4-step user journey, detailed ecosystem modules grid, and target audience breakdown.
- **Featured Providers:** 
  - Dynamic hospital directory cards (Private/Public/Specialized) showing bed counts, emergency tags, and phone hotlines.
  - Featured doctor showcases using the premium redesigned cards.
- **Refined Directory Styling:** Redesigned `DoctorCard` with verification tier badges, initials gradient avatar, and view schedule tags.
- **Reusable UI Badges:** Created `VerifiedBadge`, `TierBadge`, and `FacilityTypeBadge` components for consistent status display.
- **Optimized Routes:** Redesigned Doctor Listing page, Doctor Detail page, Navbar, Footer, and a custom 404 page following the gold/cream layout.
- **NextAuth integration:** Credentials-based login (phone + password) and role-based portal redirects.

### Recent Design Direction

- Custom theme tokens in `globals.css` with `@theme` (Tailwind v4) defining premium gradients, glassmorphism templates, and gold glows.
- Typography: Fraunces (serif display headings), Inter (sans body), and IBM Plex Mono (mono tracking-wider tags).
- Skeletons, shimmer effects, and fade-in entrance transitions unified across directory lists.

### Future Opportunities

1. **Portal UX Polish:** Admin and doctor portals remain functional but utilitarian; they could inherit the newly built glassmorphism styles and color tokens.
2. **Hospital & Diagnostic Directory Pages:** Build dedicated directory pages for hospitals and diagnostic labs (currently displayed on the homepage).
3. **Form Submissions Alerts:** Improve UI feedback on doctor registration profiles and chamber edit updates.
4. **Prescription Vault Scanner:** Integrate OCR-based file reading for automated prescription uploads.

### Conventions Established

- Tailwind v4 with custom `@theme` tokens in `globals.css`. Do not use `tailwind.config.js`.
- Server-first components; `"use client"` only for client interactive elements (e.g. `HeroSearchCard`, `DoctorFilters`).
- Maximum width limits: `max-w-7xl` for directory pages, `max-w-4xl` for detail pages.
- Lucide icons for UI markers.

### Files That Define the Product

- `prisma/schema.prisma` — data model
- `src/app/globals.css` — design tokens and custom animations
- `src/app/page.tsx` — landing experience
- `src/app/doctors/page.tsx` — search results
- `src/components/doctors/DoctorCard.tsx` — redesigned listing card
- `src/components/home/HeroSearchCard.tsx` — multi-tab symptom router
