/**
 * Motion Configuration
 * Centralized Framer Motion configuration and animation variants for the application
 */

import { Variants } from 'framer-motion';

/**
 * Standard animation durations (milliseconds)
 */
export const MOTION_DURATIONS = {
  FAST: 0.15,
  BASE: 0.3,
  SLOW: 0.5,
  SLOWER: 0.7,
} as const;

/**
 * Standard easing functions
 */
export const MOTION_EASING = {
  EASE_OUT: [0.23, 1, 0.32, 1],
  EASE_IN: [0.4, 0, 1, 1],
  EASE_IN_OUT: [0.4, 0, 0.2, 1],
  EASE_SMOOTH: [0.25, 0.46, 0.45, 0.94],
} as const;

/**
 * Animation variants for container (parent stagger)
 */
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Animation variants for fade in/out
 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: MOTION_DURATIONS.BASE,
      ease: MOTION_EASING.EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: MOTION_DURATIONS.FAST,
    },
  },
};

/**
 * Animation variants for slide up + fade
 */
export const slideUpFadeVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.BASE,
      ease: MOTION_EASING.EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: MOTION_DURATIONS.FAST,
    },
  },
};

/**
 * Animation variants for scale in
 */
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MOTION_DURATIONS.FAST,
      ease: MOTION_EASING.EASE_OUT,
    },
  },
};

/**
 * Animation variants for progress bar
 */
export const progressVariants: Variants = {
  hidden: {
    opacity: 0,
    scaleX: 0,
  },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: {
      duration: MOTION_DURATIONS.FAST,
      ease: MOTION_EASING.EASE_OUT,
    },
  },
};

/**
 * Animation variants for upload items (child)
 */
export const uploadItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.BASE,
      ease: MOTION_EASING.EASE_OUT,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: MOTION_DURATIONS.FAST,
    },
  },
};

/**
 * Configuration for document upload section
 */
export const uploadSectionConfig = {
  container: containerVariants,
  item: uploadItemVariants,
} as const;

/**
 * Animation variants for slide down + fade
 */
export const slideDownFadeVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.BASE,
      ease: MOTION_EASING.EASE_OUT,
    },
  },
};

/**
 * Animation variants for slide right + fade
 */
export const slideRightFadeVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -30,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_DURATIONS.SLOW,
      ease: MOTION_EASING.EASE_SMOOTH,
    },
  },
};

/**
 * Animation variants for blur + scale reveal
 */
export const blurScaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: MOTION_DURATIONS.SLOW,
      ease: MOTION_EASING.EASE_OUT,
    },
  },
};

/**
 * Animation variants for bounce in
 */
export const bounceInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

/**
 * Animation variants for rotate in
 */
export const rotateInVariants: Variants = {
  hidden: {
    opacity: 0,
    rotate: -10,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: MOTION_DURATIONS.BASE,
      ease: MOTION_EASING.EASE_OUT,
    },
  },
  hover: {
    scale: 1.05,
    rotate: 2,
    transition: {
      duration: MOTION_DURATIONS.FAST,
    },
  },
};

/**
 * Animation variants for flip in
 */
export const flipInVariants: Variants = {
  hidden: {
    opacity: 0,
    rotateY: 90,
  },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: MOTION_DURATIONS.SLOW,
      ease: MOTION_EASING.EASE_OUT,
    },
  },
};

/**
 * Animation variants for elastic scale
 */
export const elasticScaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      mass: 1,
    },
  },
  hover: {
    scale: 1.08,
    transition: {
      type: 'spring',
      stiffness: 300,
    },
  },
};

/**
 * Animation variants for stagger in from bottom (dashboard cards)
 */
export const staggerBottomVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: MOTION_DURATIONS.SLOW,
      ease: MOTION_EASING.EASE_OUT,
    },
  }),
};

/**
 * Animation variants for dashboard metrics
 */
export const metricsCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.SLOW,
      ease: MOTION_EASING.EASE_SMOOTH,
    },
  },
  hover: {
    y: -5,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: MOTION_DURATIONS.FAST,
    },
  },
};

/**
 * Dashboard page container animation
 */
export const dashboardPageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};
