/** Shared easing and variants for framer-motion across Hub. */
export const hubEase = [0.25, 0.1, 0.25, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1 },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0 },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const springSnappy = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
};

export const transitionFast = {
  duration: 0.32,
  ease: hubEase,
};
