# Design System Specification: The Sovereign Scholar

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Obsidian Archive."** 

This is not a standard utility interface; it is a high-performance environment designed for the "Sovereign Scholar"—an individual who demands the precision of a terminal with the aesthetic depth of a luxury editorial. We break the "template" look by eschewing traditional borders and flat grids in favor of **intentional asymmetry** and **chromatic depth**. 

The aesthetic is "Dark-First" and "Obsidian," where the interface doesn't just sit on the screen but feels carved out of light and shadow. We utilize high-contrast typography scales and overlapping glass layers to create a sense of focused, intellectual authority.

---

## 2. Colors & Thematic Variants
The system utilizes a sophisticated Material-based token structure to support three primary cognitive modes. While the tokens below represent the **AMBER NEURAL** variant, the logic remains identical for **CYBER OCEAN** and **EMERALD FOREST**.

### The "No-Line" Rule
Designers are strictly prohibited from using 1px solid borders for sectioning or layout containment. Boundaries must be defined through:
1.  **Background Color Shifts:** Placing a `surface-container-low` section against a `surface` background.
2.  **Tonal Transitions:** Using subtle shifts between `surface-container-lowest` and `surface-bright` to imply structure.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of obsidian and glass.
*   **Base:** `surface` (#131313) — The foundation of the archive.
*   **Sectioning:** `surface-container-low` (#1c1b1b) — For secondary content areas.
*   **Interaction Hubs:** `surface-container-high` (#2a2a2a) — For primary work surfaces.
*   **Floating Elements:** Use Glassmorphism (see Section 4) to elevate temporary or high-priority modules above the base layer.

### Signature Textures
Main CTAs and Hero backgrounds should utilize a subtle linear gradient transitioning from `primary` (#ffd79b) to `primary-container` (#ffb300) at a 135-degree angle. This provides a "glowing filament" effect that flat color cannot replicate.

---

## 3. Typography: Command & Control
Our typography pairs the technical precision of **Space Grotesk** with the refined readability of **DM Sans** (implemented via the `inter` token scale).

*   **Display & Headlines (Space Grotesk):** These are the "Command" elements. Use `display-lg` (3.5rem) for hero moments and `headline-sm` (1.5rem) for section headers. The tight tracking and geometric glyphs should feel like a high-end instrument cluster.
*   **Body & Titles (DM Sans):** The "Editorial" elements. These handle the heavy lifting of scholarly content. `body-md` (0.875rem) is the standard for long-form reading, providing a humanistic counterpoint to the tech-heavy headers.
*   **Labels (Space Grotesk):** `label-sm` (0.6875rem) should be used for metadata and micro-copy, always in uppercase with a 0.05rem letter-spacing to maintain a "Terminal" feel.

---

## 4. Elevation, Depth & Glassmorphism
We convey hierarchy through **Tonal Layering** rather than traditional structural lines.

### The Layering Principle
Depth is achieved by "stacking" the surface-container tiers. For example, a `surface-container-lowest` card placed on a `surface-container-low` section creates a recessed "void" effect that naturally draws the eye without the need for a shadow.

### Glassmorphism (The Sovereign Overlay)
For floating modals, command palettes, or persistent navigation:
*   **Backdrop:** `surface` at 60% opacity.
*   **Blur:** 10px to 20px Gaussian blur.
*   **The "Ghost Border":** A 1px border using `outline-variant` (#514532) at 10% opacity, or pure white at 10% opacity for high-contrast themes.
*   **Effect:** This allows the "obsidian" background colors to bleed through, ensuring the UI feels like a single, integrated machine rather than a series of disconnected boxes.

### Ambient Shadows
When a "floating" effect is mandatory, shadows must be ultra-diffused:
*   **Blur:** 40px - 60px.
*   **Opacity:** 4% - 8%.
*   **Color:** Use a tinted version of `surface-tint` (#ffba38) rather than pure black to simulate the ambient glow of the neural displays.

---

## 5. Components & Haptic Logic

### Haptic-Ready Interactions
All interactive primitives must feel tactile and responsive.
*   **Hover State:** Scale to `1.02x` with a `200ms` ease-out transition.
*   **Pressed State:** Scale to `0.98x` with a `100ms` ease-in-out transition.
*   **Focus State:** Utilize a `primary` (#ffd79b) outer glow (4px spread, 20% opacity).

### Buttons
*   **Primary:** Background: `primary` (#ffd79b), Text: `on-primary` (#432c00). Shape: `md` (0.375rem).
*   **Secondary:** Background: `secondary-container` (#474746), Text: `on-secondary-container` (#b7b5b4).
*   **Tertiary:** No background. Text: `primary`. Transition to a `surface-variant` background on hover.

### Input Fields
*   **Terminal Style:** Inputs should never be fully enclosed boxes. Use a `surface-container-highest` (#353534) background with a bottom-only `outline-variant` (#514532) stroke.
*   **Focus:** The bottom stroke transitions to `primary` (#ffd79b).

### Cards & Lists
*   **Divider Forbid:** The use of `divider` lines is strictly forbidden. 
*   **Separation:** Use `8-point spatial rhythm` (e.g., `spacing-8` or `spacing-10`) to create "islands" of content. Separate list items using alternating `surface` and `surface-container-low` backgrounds for a subtle "zebra-stripe" effect that feels intentional and premium.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align text to the left but allow imagery or data visualizations to bleed off the right edge of the grid.
*   **Use Tonal Depth:** Use `surface-container-lowest` (#0e0e0e) to create "wells" of focus for data input.
*   **Apply Wide Tracking:** For labels, use increased letter-spacing to enhance the "Sovereign" tech aesthetic.

### Don't:
*   **Don't Use 100% White:** Use `on-surface` (#e5e2e1) for text to prevent eye strain in dark-first environments.
*   **Don't Use High-Contrast Borders:** Never use a 100% opaque border to separate content; it breaks the "Obsidian" immersion.
*   **Don't Over-stack Glass:** Limit glassmorphism to two layers; any more will degrade performance and visual clarity.

### Accessibility Note:
Ensure that while using "Ghost Borders" and Tonal Layering, the contrast ratio between `on-surface` text and the chosen `surface-container` variant always meets WCAG AA standards (minimum 4.5:1).