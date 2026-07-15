import type { Variants, Transition } from "motion/react";

/**
 * Shared motion vocabulary for HealthCapsule.
 *
 * Defined at module scope (not inline) so object identities stay stable
 * across renders — see the framer-motion skill's "avoid inline objects" rule.
 * We animate ONLY transform + opacity for GPU acceleration and zero layout shift.
 */

/** The one easing curve used across the site — calm, deliberate, not bouncy. */
export const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

/** Standard fade-up entrance. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

/** Lighter fade-up for dense grids where big offsets feel busy. */
export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

/** Container that staggers its StaggerItem children on reveal. */
export const staggerContainer = (
  stagger = 0.08,
  delayChildren = 0.1
): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Reusable transition for standalone (non-variant) motion elements. */
export const revealTransition = (delay = 0, duration = 0.6): Transition => ({
  duration,
  delay,
  ease: EASE,
});
