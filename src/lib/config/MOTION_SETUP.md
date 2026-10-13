/\*\*

- Framer Motion Configuration Documentation
-
- This document explains the professional motion/animation setup for Auspira
  \*/

/\*\*

- SETUP OVERVIEW
-
- 1.  Installation
- - Framer Motion is installed as a project dependency
- - Command: npm install framer-motion
-
- 2.  Root Level Provider
- - MotionProvider wraps entire application in providers/index.tsx
- - Placed as outermost provider for animation initialization
- - File: providers/MotionProvider.tsx
-
- 3.  Centralized Configuration
- - All animation variants and durations defined in lib/config/motion.config.ts
- - Ensures consistency across the application
- - Single source of truth for animation behavior
    \*/

/\*\*

- MOTION CONFIGURATION FILE
- Location: lib/config/motion.config.ts
-
- Contains:
- - MOTION_DURATIONS: Fast (0.15s), Base (0.3s), Slow (0.5s), Slower (0.7s)
- - MOTION_EASING: Multiple easing functions (ease-out, ease-in, ease-in-out, smooth)
- - Animation Variants:
- • fadeInVariants - Simple fade in/out
- • slideUpFadeVariants - Slide up with fade (common for sections)
- • scaleInVariants - Scale up animation (good for success states)
- • progressVariants - Progress bar animation
- • uploadItemVariants - Individual upload item animation
- • containerVariants - Parent container for staggered children
  \*/

/\*\*

- USAGE PATTERNS
  \*/

// Pattern 1: Simple motion div with fade
import { motion } from 'framer-motion';
import { fadeInVariants } from '@/lib/config/motion.config';

export function Example1_FadeAnimation() {
return (
<motion.div
variants={fadeInVariants}
initial="hidden"
animate="visible" >
Content with fade animation
</motion.div>
);
}

// Pattern 2: Container with staggered children
import { containerVariants, uploadItemVariants } from '@/lib/config/motion.config';

export function Example2_StaggeredList() {
const items = ['Item 1', 'Item 2', 'Item 3'];

return (
<motion.div
variants={containerVariants}
initial="hidden"
animate="visible" >
{items.map((item) => (
<motion.div
key={item}
variants={uploadItemVariants} >
{item}
</motion.div>
))}
</motion.div>
);
}

// Pattern 3: Conditional animations with AnimatePresence
import { AnimatePresence } from 'framer-motion';
import { progressVariants } from '@/lib/config/motion.config';

export function Example3_ConditionalAnimation() {
const [isLoading, setIsLoading] = React.useState(false);

return (
<AnimatePresence>
{isLoading && (
<motion.div
variants={progressVariants}
initial="hidden"
animate="visible"
exit="hidden" >
Loading...
</motion.div>
)}
</AnimatePresence>
);
}

// Pattern 4: Hover animations
import { uploadItemVariants } from '@/lib/config/motion.config';

export function Example4_HoverAnimation() {
return (
<motion.div
variants={uploadItemVariants}
whileHover="hover" >
Hover me!
</motion.div>
);
}

/\*\*

- ANIMATION VARIANTS REFERENCE
-
- 1.  fadeInVariants
- - hidden: { opacity: 0 }
- - visible: { opacity: 1, duration: 0.3s }
- - exit: { opacity: 0, duration: 0.15s }
- Use for: Simple fade-in sections
-
- 2.  slideUpFadeVariants
- - hidden: { opacity: 0, y: 20 }
- - visible: { opacity: 1, y: 0, duration: 0.3s }
- - exit: { opacity: 0, y: 20, duration: 0.15s }
- Use for: Sections entering from bottom (like dialogs, modals)
-
- 3.  scaleInVariants
- - hidden: { opacity: 0, scale: 0.8 }
- - visible: { opacity: 1, scale: 1, duration: 0.15s }
- Use for: Success states, checkmarks, confirmations
-
- 4.  progressVariants
- - hidden: { opacity: 0, scaleX: 0 }
- - visible: { opacity: 1, scaleX: 1, duration: 0.15s }
- Use for: Progress bars appearing
-
- 5.  uploadItemVariants (children)
- - hidden: { opacity: 0, y: 10 }
- - visible: { opacity: 1, y: 0, duration: 0.3s }
- - hover: { scale: 1.02, duration: 0.15s }
- Use for: Individual list items with stagger effect
-
- 6.  containerVariants (parent)
- - hidden: { opacity: 0 }
- - visible: { opacity: 1, staggerChildren: 0.1, delayChildren: 0.2 }
- Use for: Container wrapping multiple animated children
  \*/

/\*\*

- INTEGRATED COMPONENTS
-
- The following components currently use Framer Motion:
-
- 1.  UploadDocumentsSection
- - Section slides up with fade on mount
- - Header fades in smoothly
-
- 2.  DocumentGrid
- - Container uses staggered animation
- - Each item slides up with stagger delay
- - Hover effect scales items slightly
-
- 3.  DocumentUploadItem
- - Success checkmark scales in (scaleInVariants)
- - Progress bar fades in and scales (progressVariants)
- - Uses AnimatePresence for smooth enter/exit
    \*/

/\*\*

- BEST PRACTICES
-
- 1.  Import from lib/config/motion.config.ts
- Always import animation variants from the centralized config file
- for consistency and maintainability.
-
- 2.  Use Predefined Variants
- Prefer using existing variants (fadeInVariants, slideUpFadeVariants, etc.)
- over creating custom ones for consistency.
-
- 3.  Respect Performance
- - Keep animations under 500ms for snappy UX
- - Use AnimatePresence for conditional animations
- - Avoid animating too many elements simultaneously
-
- 4.  Accessibility
- Consider using prefers-reduced-motion for critical animations:
- const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
-
- 5.  Stagger Children
- Use containerVariants + uploadItemVariants pattern for lists
- to create professional staggered effects.
-
- 6.  AnimatePresence
- Always wrap conditional animations in AnimatePresence
- to ensure proper exit animations.
  \*/

/\*\*

- ADDING NEW ANIMATIONS
-
- To add new animation patterns:
-
- 1.  Define variant in lib/config/motion.config.ts
- 2.  Export it as const
- 3.  Import and use in component with motion.div/motion.span
- 4.  Document the variant in this file
-
- Example:
- ```typescript

  ```

- export const slideLeftFadeVariants: Variants = {
- hidden: { opacity: 0, x: -20 },
- visible: { opacity: 1, x: 0, transition: { duration: MOTION_DURATIONS.BASE } },
- };
- ```
  */
  ```

/\*\*

- TROUBLESHOOTING
-
- Issue: Animations not working
- - Ensure MotionProvider is in providers/index.tsx
- - Check 'use client' directive in components
- - Verify variants are imported correctly
-
- Issue: Animations are choppy
- - Reduce animation duration
- - Avoid animating layout properties
- - Use will-change CSS when needed
-
- Issue: Exit animation not playing
- - Wrap in AnimatePresence component
- - Ensure exit variants are defined
- - Check that component is conditionally rendered
    \*/
