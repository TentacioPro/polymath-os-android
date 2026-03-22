/**
 * Kole Jain Design System - Core Enforcement Layer
 * Extracted from KOLE JAIN Agent Skills JSON MARCH 21
 */

/**
 * Phase 1: Spatial Architecture (8-Point Rhythm)
 * Enforces strict mathematical spacing grid.
 */
export const KoleJainSpacing = {
  isValid: (value: number) => value % 8 === 0,
  enforce: (value: number): number => {
    if (!KoleJainSpacing.isValid(value)) {
      console.warn(`[KoleJainSystem] Invalid spacing value: ${value}. Must be a multiple of 8.`);
      // Auto-correct to nearest 8 in dev
      return Math.round(value / 8) * 8;
    }
    return value;
  },
  // Base scales
  base: 8,
  get: (multiplier: number) => 8 * multiplier,
};

/**
 * Phase 2: Graphic Design Mathematics (Typography)
 * Implements Geometric Scaling Sequences (1.25x / 1.5x)
 */
export const KoleJainTypography = {
  /**
   * Calculates font size based on modular scale.
   * @param baseSize Default is 16
   * @param step The scale step (e.g., -1, 0, 1, 2)
   * @param ratio The scale ratio (e.g., 1.25 for Major Third, 1.5 for Perfect Fifth)
   */
  getModularSize: (baseSize: number = 16, step: number, ratio: number = 1.25): number => {
    return Math.round(baseSize * Math.pow(ratio, step));
  },
  
  /**
   * Calculates optimal line height based on font size and line length.
   * Usually between 1.4 and 1.6
   */
  getLineHeight: (fontSize: number, isHeading: boolean = false): number => {
    if (isHeading) return Math.round(fontSize * 1.2);
    // Base body line height
    const calculated = fontSize * 1.5;
    // Align to 4pt grid (sub-grid of 8pt)
    return Math.round(calculated / 4) * 4;
  }
};

/**
 * Phase 3: Premium Software Art Direction
 * Glassmorphism and Semantic Layers
 */
export const KoleJainGlass = {
  // Phase 3.4
  performanceOptimized: {
    base: {
      backdropFilter: 'blur(24px)', // Limited heavy blur
      WebkitBackdropFilter: 'blur(24px)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    // In dark modes, we use HSL lightness ladders instead of drop shadows
    elevation: (step: number) => {
      // step 1: 5%, step 2: 8%, step 3: 11%, step 4: 15%
      const lightness = 2 + (step * 3);
      return `hsl(var(--m3-surface-hsl) / ${lightness}%)`;
    }
  }
};

/**
 * Phase 4.2: Cognitive Interruption Routing (Hick's Law)
 * Times for interaction feedback
 */
export const KoleJainMotion = {
  spring: {
    stiffness: 400,
    damping: 30,
    mass: 1,
  },
  timing: {
    enter: 200, // Drawer enters
    exit: 300,  // Drawer exits
    micro: 150, // Button presses
  }
};

/**
 * Validatable Skills Manifest for display in Agent UI
 */
export const KOLE_JAIN_SKILLS = [
  { phase: 1, name: "Spatial Architecture", rule: "Strict 8-Point Rhythm" },
  { phase: 2, name: "Mathematical Typography", rule: "Geometric Sequence Scaling" },
  { phase: 3, name: "Premium Art Direction", rule: "Zero-Shadow HSL Elevation" },
  { phase: 4, name: "Interaction Mechanics", rule: "Physics-Driven Springs" },
  { phase: 5, name: "Vibe Enforcement", rule: "Destruction of Default Accents" }
];
