# Design System Specification: The Obsidian Instrument

## 1. Overview & Creative North Star
**Creative North Star: The Sovereign Scholar**
This design system is not a mere interface; it is a high-performance instrument for intellectual mastery. It rejects the "web-page" aesthetic in favor of a **Luxury Instrument Panel**—a "True Tech Void" where information does not sit on a screen, but glows within a vacuum.

To break the "template" look, we utilize **Intentional Asymmetry**. While the bento grid provides the skeleton, content should bleed across gutters or utilize extreme "negative-space weighting" to create an editorial, high-end feel. The goal is a digital environment that feels as silent, heavy, and precise as a block of machined obsidian.

---

## 2. Colors & Surface Architecture
The palette is rooted in the "True Tech Void." We utilize the M3 Tonal Palette but restrict it to a monochromatic, silver-on-obsidian execution to maintain the "Instrument" feel.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders for sectioning are prohibited. Boundaries must be defined solely through background color shifts or subtle tonal transitions. A section ends where the lightness of the surface changes.

### Surface Hierarchy & Nesting
Depth is achieved through **HSL Lightness-based Elevation**. In this "Void," higher importance means more light, not more shadow.
*   **Base Layer:** `surface` (#131313) or `surface_container_lowest` (#0e0e0e) for the deep background.
*   **The Bento Module:** Use `surface_container_low` (#1b1b1b) for standard grid cells.
*   **The Active Focus:** Use `surface_container_high` (#2a2a2a) to draw the eye to active learning modules.
*   **Nesting:** Place a `surface_container_highest` (#353535) element inside a `surface_container` (#1f1f1f) to create a "recessed" or "elevated" feel without a single border line.

### The "Glass & Gradient" Rule
Floating overlays (Modals, Command Palettes) must use **Glassmorphism**.
*   **Background:** `surface_variant` (#353535) at 60% opacity.
*   **Effect:** `backdrop-filter: blur(20px)`.
*   **Texture:** Apply a subtle linear gradient on primary CTAs from `primary` (#ffffff) to `secondary_fixed_dim` (#ababab) at a 135° angle to mimic the sheen of brushed silver.

---

## 3. Typography: The Editorial Scale
We employ a geometric scaling (1.25x) to create high-contrast hierarchy. 

*   **Display & Headlines (Space Grotesk):** These are the "labels" of the instrument. Use `display-lg` (3.5rem) for core metrics or titles, keeping letter-spacing tight (-0.02em) to maintain a technical, engineered look.
*   **Body & Titles (Inter/DM Sans):** Inter provides the utilitarian legibility required for deep learning. `body-md` (0.875rem) is the workhorse for synthesis and AI-generated insights.
*   **Hierarchy as Identity:** Use `label-sm` (0.6875rem) in all-caps with 0.1rem letter-spacing for metadata. This mimics the "engraved" labels on high-end audio hardware.

---

## 4. Elevation & Depth: The Layering Principle
Shadows are non-existent in this dark-first world. We replace them with **Tonal Stacking**.

*   **Ambient Shadows:** If a floating element (like an AI agent tooltip) requires separation from a busy background, use a diffused glow rather than a shadow. Color: `primary` (#ffffff) at 4% opacity, Blur: 40px.
*   **The Ghost Border Fallback:** If accessibility requires a container edge, use `outline_variant` (#474747) at 15% opacity. It should be felt, not seen.
*   **Interaction States:** When a user hovers over a bento cell, shift its background from `surface_container_low` to `surface_bright` (#393939). The "lift" is purely luminous.

---

## 5. Components: Machined Precision

### Buttons
*   **Primary:** Background: `primary` (#ffffff) | Text: `on_primary` (#1a1c1c). Corner radius: `sm` (0.125rem) for a sharp, technical finish.
*   **Secondary:** Background: `surface_container_highest` (#353535) | Text: `on_surface` (#e2e2e2).
*   **Tertiary:** Text: `primary` (#ffffff) | No background. Use for low-emphasis navigation.

### Input Fields
*   **Style:** No background. Only a bottom "Ghost Border" using `outline_variant`.
*   **Active State:** The bottom border transitions to `primary` (#ffffff) with a 2px height. Label moves to `label-sm` above the field.

### Bento Cards
*   **Rules:** Forbid dividers. Use `spacing.8` (1.75rem) as the internal padding gutter. 
*   **Layout:** Content should be "bottom-heavy"—place titles at the bottom-left of the card to mimic luxury watch faces or instrument dials.

### AI Pulse (Signature Component)
*   A 2px tall indeterminate progress bar at the very top of a container. 
*   **Color:** Linear gradient from `secondary` (#c6c6c6) to `primary` (#ffffff). This indicates the "Learning Engine" is active.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use the 8-point spatial rhythm religiously. If a gap looks "almost" right, it must be snapped to the nearest `0.4rem` or `0.8rem` increment.
*   **DO** use `surface_container_lowest` (#0e0e0e) for the outer-most bento margins to create a "floating in space" effect.
*   **DO** treat silver (`#C0C0C0`) as a light source. Use it sparingly to guide the user's focus.

### Don't:
*   **DON'T** use 100% white (#ffffff) for body text. Use `on_surface_variant` (#c6c6c6) to prevent eye strain in the dark void.
*   **DON'T** use rounded corners larger than `xl` (0.75rem). This system is about precision; overly round corners make it feel like a toy.
*   **DON'T** use standard "Drop Shadows." If it doesn't look like it's glowing or stacking, it doesn't belong.