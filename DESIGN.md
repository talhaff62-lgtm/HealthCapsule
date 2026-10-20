# DESIGN.md — HealthCapsule Web

## Color tokens (added to the @theme block in globals.css)
- `--color-ink: #0B1220` — headings / primary text on light
- `--color-ink-muted: #52627A` — secondary text on light
- `--color-page: #F5F8FD` — page background (soft blue-white)
- `--color-teal: #00B8A9` — secondary accent (gradient partner, small highlights)
- `--shadow-soft: 0 12px 40px -12px rgb(11 31 58 / 0.14)` — section canvases, floating nav
- `--shadow-card: 0 4px 24px -8px rgb(11 31 58 / 0.10)` — cards
- `--radius-canvas: 2.5rem` — section canvas radius
Existing brand tokens stay: brand-navy #0b1f3a, brand-sky #0ea5e9, brand-sky-dark #0284c7, brand-sky-deep #0369a1, brand-sky-bright #38bdf8, brand-sky-bg #e0f2fe, brand-sky-bg-soft #f0f9ff, brand-cloud/mist/grays, status colors.

## Color roles
- Page bg: bg-page. Canvas surfaces: white, brand-sky-bg-soft/60 (tint), brand-navy (contrast moments only: StatsBar, CtaBanner, Footer).
- Text on light: ink (headings), ink-muted (body). Text on navy: white + white/70, accents brand-sky-bright.
- Accents: brand-sky (primary interactive), teal only as gradient partner + tiny highlights. Links on light: text-brand-sky-deep (contrast ≥4.5:1). Eyebrows: brand-sky-deep on light, brand-sky-bright on navy.
- Gradient: `linear-gradient(120deg, #0ea5e9, #00B8A9)` — hero keyword text, hero CTA button, thin ornament lines only.

## Type
Families: Fraunces (font-serif) headings; Inter (font-sans) body/UI; IBM Plex Mono (font-mono) eyebrows/labels only, `text-xs uppercase tracking-[0.2em]`.
Scale: H1 text-4xl→sm:text-5xl→lg:text-6xl, font-serif, font-medium, tracking-tight, leading-[1.05]. H2 section titles text-3xl sm:text-4xl font-serif. Body text-base/relaxed. Stat numbers text-4xl font-serif tabular-nums.

## Spacing & layout
- Page gutter: px-3 sm:px-4; canvas stack gap: flex flex-col gap-4 sm:gap-5.
- Canvas inner container: mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-20 (lg:px-8 where used today).
- Section header block (all sections): centered, max-w-2xl mx-auto; eyebrow (mono) → H2 (serif) → subtext (ink-muted, mt-3); margin-bottom mt-12 sm:mt-16 before content.

## Shape & shadow
- Canvas: rounded-[1.75rem] sm:rounded-[var(--radius-canvas)], shadow-soft, relative overflow-hidden.
- Cards: rounded-3xl (24px), shadow-card, border border-ink/5 where on tinted bg.
- Buttons: pill rounded-full; primary = gradient (sky→teal) text-white shadow-card, hover:brightness-105; secondary on light = bg-white border border-ink/10 text-ink hover:border-brand-sky; on navy = bg-white text-ink / border border-white/30 text-white.
- Nav pill: rounded-2xl (16px).
- Soft glows inside navy canvases: absolute rounded-full blur-3xl, bg-brand-sky/20 + bg-teal/20, opacity ≤30%.

## Component rules & states
- Navbar (floating glass): fixed inset-x-0 top-0 z-50 with px-3 pt-3 sm:px-4 sm:pt-4; inner pill h-16 max-w-7xl mx-auto rounded-2xl border border-ink/8 bg-white/75 backdrop-blur-xl [backdrop-saturate:1.4] shadow-soft px-4 sm:px-6; brand + links in ink; active link text-brand-sky-dark; scrolled state: bg-white/90 + stronger shadow. A sibling spacer div h-[76px] sm:h-[80px] rendered when nav is visible so fixed bar never covers content. Mobile: hamburger in pill; portal panel mt-2 rounded-3xl border border-ink/8 bg-white/95 backdrop-blur-xl p-4 shadow-soft with ink links.
- Buttons: every button min-height 44px on mobile (py-3). Hover: brightness/border/color shifts only, transition duration-300. Focus-visible: ring-2 ring-brand-sky ring-offset-2.
- Cards (doctor/facility/blog/video): rounded-3xl shadow-card bg-white, hover -translate-y-0.5 transition duration-300 (keep existing hover content).
- Inputs/search card: rounded-3xl white card, shadow-soft; field inputs rounded-xl border border-brand-gray bg-white px-4 py-3 text-sm; tab strip = segmented pill: wrapper rounded-full bg-brand-mist border border-brand-gray p-1, active tab rounded-full bg-white shadow-sm text-ink font-medium, inactive text-ink-muted.
- Empty/loading states: unchanged (server-rendered, render null when empty — keep that behavior).

## Image treatment
Rounded-3xl crops; doctor/facility photos object-cover; illustrations keep existing assets, framed in white rounded-[2rem] cards with shadow-card.

## Motion rules
- Hover/interactive: 200-300ms ease-out. Entrances: existing hero float keyframes kept (they already exist). Aurora: two blurred gradient circles in hero canvas, `motion-safe:animate-[drift_18s_ease-in-out_infinite_alternate]`, new `@keyframes drift` = translate/scale ±4%.
- prefers-reduced-motion: all decorative animation gated with motion-safe: (existing pattern). Nothing animates layout properties; transform/opacity only.

## Do / Don't
DO: keep every data fetch and prop identical; keep server components server; use the new tokens; keep Bangladesh context strings as-is.
DON'T: no new npm deps; no new fonts; no dark full-bleed bands (navy appears only inside rounded canvases); no straight-edge section dividers (remove border-t separators); no HTML sanitizers; no copy of the reference HTML's layout.

## Footer
Navy canvas: mx-3 mb-3 sm:mx-4 sm:mb-4 rounded-[1.75rem] sm:rounded-[var(--radius-canvas)] bg-brand-navy text-white overflow-hidden shadow-soft; top ornament: h-px bg-gradient-to-r from-brand-sky to-teal. Keep all columns/links/badges.
