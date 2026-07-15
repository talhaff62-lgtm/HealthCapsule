"use client";

import { motion, useReducedMotion } from "motion/react";
import { staggerContainer, fadeUpSmall, EASE } from "./variants";

interface StaggerContainerProps {
  children: React.ReactNode;
  /** Delay between each child reveal. */
  stagger?: number;
  /** Delay before the first child starts. */
  delayChildren?: number;
  className?: string;
}

/**
 * Wraps a grid/list and reveals each child in sequence as the container
 * scrolls into view. Pair every direct child with <StaggerItem>.
 *
 * Uses variants so the stagger propagates automatically from parent to child.
 */
export function StaggerContainer({
  children,
  stagger = 0.08,
  delayChildren = 0.1,
  className,
}: StaggerContainerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    // Render children statically — no variants, no hooks beyond the reduce check.
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A single item inside a <StaggerContainer>. Gets the fade-up variant.
 * Works for grids of cards, step lists, etc.
 */
export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={fadeUpSmall} className={className}>
      {children}
    </motion.div>
  );
}

export { EASE };
export default StaggerContainer;
