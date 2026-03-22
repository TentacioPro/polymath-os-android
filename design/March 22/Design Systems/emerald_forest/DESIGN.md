# Design System Specification: Emerald Forest Protocol

## 1. Overview & Creative North Star: "The Kinetic Terminal"
This design system is a high-performance interface language built for Polymath OS. It rejects the soft, rounded "consumer-web" aesthetic in favor of **The Kinetic Terminal**—a North Star that treats the screen as a sophisticated, multi-layered data environment. 

Inspired by the Kole Jain manifest, this system prioritizes raw functionalism and brutalist intentionality. We move beyond "standard" dark mode by utilizing an obsidian-base palette and neon-primary accents. The visual signature is defined by high-contrast typography, zero-radius geometry, and depth achieved through HSL-based tonal shifting rather than traditional skeuomorphism. It is a digital environment for power users that feels like a redacted document coming to life.

---

## 2. Colors
The color architecture is built on a "High-Contrast Obsidian" foundation. It utilizes a strict hierarchy to guide the eye through dense information without the noise of unnecessary decoration.

### The Obsidian Palette
*   **Surface (Base):** `#0b0f0b` (The void)
*   **Primary (Action):** `#a4ffb9` (The signal)
*   **Primary Container:** `#00fd87` (High-intensity neon)
*   **Surface Containers:** From `lowest` (`#000000`) to `highest` (`#212721`).

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for layout sectioning. In this system, boundaries are defined by **background color shifts**. To separate a sidebar from a main content area, place a `surface-container-low` element against the `surface` background. This creates a clean, architectural break that feels structural rather than "drawn."

### Glass & Gradient Implementation
While the system is largely flat and brutalist, "Soul" is injected through:
*   **Tactical Glass:** Floating overlays (modals/tooltips) must use a semi-transparent `surface-container-high` with a heavy `backdrop-blur` (20px+). This creates a "frosted obsidian" effect that maintains context.
*   **Signal Gradients:** Use a subtle linear gradient (from `primary` to `secondary`) only for primary action states to provide a sense of "charged energy" in the neon elements.

---

## 3. Typography: Space Grotesk
We utilize **Space Grotesk** for its idiosyncratic, geometric apertures which reinforce the hacker/matrix aesthetic.

*   **Display Scale:** Use `display-lg` (3.5rem) and `display-md` (2.75rem) with tightened letter-spacing (-0.02em) for editorial impact. These are not just titles; they are structural landmarks.
*   **Functional Scale:** Labels and Body text must remain generous in tracking (+0.01em) to ensure legibility against the high-contrast obsidian background.
*   **Hierarchy as Identity:** Use `label-sm` (0.6875rem) in all-caps for metadata and system status. The contrast between massive display type and tiny, precise labels creates the "OS" feel.

---

## 4. Elevation & Depth (HSL-Based)
This system strictly prohibits the use of CSS `box-shadow`. Depth is conveyed through **Tonal Layering** and **HSL-based luminosity shifts**.

### The Layering Principle
Think of the UI as a series of stacked obsidian plates.
1.  **Level 0 (Background):** `surface` (#0b0f0b)
2.  **Level 1 (Nesting):** `surface-container-low` (#101510)
3.  **Level 2 (Cards/Modules):** `surface-container` (#161b16)
4.  **Level 3 (Floating/Interaction):** `surface-container-highest` (#212721)

### The "Ghost Border" Fallback
Where accessibility requires a container definition (e.g., in a complex data grid), use a **Ghost Border**: a 1px stroke using `outline-variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons: The "Data-Block" Variant
All buttons utilize a **0px border-radius**. 
*   **Primary:** Background: `primary_container` (#00fd87), Text: `on_primary` (#006532). High-vibrancy, zero-roundedness.
*   **Tertiary:** No background, `outline-variant` Ghost Border. Text: `primary`.

### Input Fields: The "Underline" Aesthetic
To maintain the terminal look, inputs should not be boxes. Use a bottom-only border (2px) using `outline-variant`. On focus, transition the border color to `primary` and introduce a subtle `surface-bright` background tint.

### Cards & Lists: Spatial Separation
*   **No Dividers:** Horizontal rules (HRs) are banned. Separation is achieved through the **8pt spatial rhythm** (specifically `spacing.8` or `1.75rem` gaps) or subtle shifts between `surface-container-low` and `surface-container-high`.
*   **Lists:** Interactive list items should use a `primary_dim` left-accent bar (3px width) on hover to signal focus.

### Additional Component: The "Status Glitch" Chip
A custom component for Polymath OS. Selection chips use `secondary_container` with a `label-md` font. When "Active," the chip should have a 10% opacity `primary` glow (using HSL-based inner tint, not shadow).

---

## 6. Do’s and Don’ts

### Do:
*   **Maintain the Grid:** Stick religiously to the 8pt spatial rhythm. Asymmetry is encouraged, but it must be mathematically aligned to the scale.
*   **Embrace the Dark:** Allow for large areas of `surface-container-lowest` to give the UI breathing room and "luxury dark" appeal.
*   **Use Mono-Spacing for Data:** While the main font is Space Grotesk, use a system monospace font for all numerical data and coordinates.

### Don't:
*   **No Rounded Corners:** Never use a border-radius. Everything is a hard edge (0px).
*   **No Grey Shadows:** If you must create separation, use HSL-shifted background colors, never a black or grey drop-shadow.
*   **No Default Transitions:** Use "Cubic Bezier (0.4, 0, 0.2, 1)" for all transitions. Movements should feel "snappy" and robotic, not "soft" or "organic."