# UI Contrast & Token Consistency Review

## Verdict: NEEDS_FIXES

Several low-contrast combinations remain, mostly `text-brand-navy-muted` / `text-brand-gold-dark` on light backgrounds and semi-transparent status-alert backgrounds. `npm run lint` and `npm run build` both pass, but WCAG 2.1 AA contrast is not yet achieved everywhere.

## Issues

1. **`src/components/home/FeaturedHospitals.tsx` — `text-brand-navy-muted` used on white/cream backgrounds**
   - Lines 175, 190, 196, 230, 244
   - `#7e8faa` on `#ffffff` / `#f7f4ec` is ~3.9:1, below the 4.5:1 AA threshold for normal text.
   - Suggested fix: replace all five occurrences with `text-brand-muted`.

2. **`src/components/home/FeaturedHospitals.tsx` — ambulance capability tag fails contrast**
   - Line 212: `bg-brand-gold-light text-brand-gold-dark`
   - `#b08b3a` on `#f3e6c2` is ~2.9:1.
   - Suggested fix: use `bg-brand-gold-light text-brand-navy` (or `text-brand-slate`).

3. **`src/components/doctors/DoctorCard.tsx` — metadata icons use low-contrast muted navy**
   - Lines 85, 91: `text-brand-navy-muted` icons inside `text-brand-muted` metadata rows on white cards.
   - Suggested fix: replace both icon classes with `text-brand-muted`.

4. **`src/components/doctors/DoctorCard.tsx` — "View schedule" link fails contrast**
   - Line 98: `text-brand-gold-dark`
   - `#b08b3a` on `#ffffff` is ~2.8:1.
   - Suggested fix: use `text-brand-gold` (still borderline on white but better) or, preferably, `text-brand-navy` / `text-brand-slate`.

5. **`src/components/doctors/DoctorFilters.tsx` — filter labels are gold on a light glass background**
   - Lines 48, 62, 81: `text-brand-gold` labels on `glass-card` (`bg-white/70` over cream).
   - `#c9a24b` on ~`#ffffff` is ~2.1:1.
   - Suggested fix: use `text-brand-muted` for labels (consistent with the standard input pattern).

6. **`src/app/login/page.tsx` — error alert uses a semi-transparent status background**
   - Line 93: `bg-status-emergency-light/40 text-status-emergency`
   - The 40% opacity background lightens the text-background pair and drops contrast below AA.
   - Suggested fix: use the solid semantic pair `bg-status-emergency-light text-status-emergency`.

7. **`src/components/doctor-portal/DoctorProfileForm.tsx` — status messages use semi-transparent backgrounds**
   - Lines 48–49: `bg-status-verified-light/40 text-status-verified` and `bg-status-emergency-light/40 text-status-emergency`
   - Suggested fix: use solid `bg-status-verified-light text-status-verified` and `bg-status-emergency-light text-status-emergency`.

8. **`src/components/doctor-portal/ChamberForm.tsx` — status messages use semi-transparent backgrounds**
   - Lines 93–94: same pattern as issue #7.
   - Suggested fix: use the solid status semantic pairs.

9. **`src/components/admin-portal/AdminDoctorRow.tsx` — inline toast uses semi-transparent backgrounds**
   - Lines 102–103: `bg-status-verified-light/40 text-status-verified` and `bg-status-emergency-light/40 text-status-emergency`
   - Suggested fix: use the solid status semantic pairs.

10. **`src/components/home/HeroSearchCard.tsx` — ambulance tab hover reduces contrast**
    - Line ~108: `text-status-emergency hover:text-status-emergency/90`
    - The hover opacity lowers the already borderline emergency-red contrast against the cream card.
    - Suggested fix: remove the opacity, use `text-status-emergency hover:text-status-emergency` or `hover:text-brand-navy`.

11. **Systematic: `text-brand-gold` section labels on cream backgrounds fail WCAG AA**
    - Representative occurrences in modified files:
      - `src/components/home/WhySection.tsx:24`
      - `src/components/home/TrustSection.tsx:29`
      - `src/components/home/HealthCapsuleAI.tsx:54`
      - `src/components/home/Audiences.tsx:48`
      - `src/components/home/FeaturedHospitals.tsx:147`
    - `#c9a24b` on `#f7f4ec` / `#efe8d6` is ~1.7:1 — far below 4.5:1 for normal text.
    - Suggested fix: change small uppercase section labels on cream to `text-brand-navy` or `text-brand-slate`. (Labels on `bg-brand-navy`, e.g. in `CtaBanner` and `Modules`, can remain `text-brand-gold`.)

12. **`src/components/ui/FacilityTypeBadge.tsx` — HOSPITAL badge fails contrast (unmodified file scan)**
    - Line 14: `bg-facility-private-bg text-facility-private` maps to `bg-brand-gold-light text-brand-gold`.
    - `#c9a24b` on `#f3e6c2` is ~2.1:1.
    - Suggested fix: use `bg-brand-navy-light text-white` or `bg-brand-cream text-brand-navy` for the hospital type, consistent with the capability-tag fix in the plan.

## Build & Lint Output Summary

### `npm run lint`
- Result: pass (0 errors, 11 warnings)
- Warnings are existing unused-import / no-img-element issues, none are errors and none block the build.

### `npm run build`
- Result: success
- Compiled and generated static pages without TypeScript or build errors.

## Notes

- `--color-brand-navy-dark: #071528;` is correctly defined in `src/app/globals.css`, so uses of `text-brand-navy-dark` are not undefined-token issues.
- No remaining `text-brand-navy-muted` was found on `bg-brand-navy` or navy-derived backgrounds.
- No white text on semi-transparent light backgrounds was found.
