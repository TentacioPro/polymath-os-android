# Design System Specification: Polymath OS

## 1. Overview & Creative North Star: "The Abyssal Architect"
This design system rejects the "flat web" in favor of a high-fidelity, cinematic interface that mimics a deep-sea command center. The Creative North Star is **The Abyssal Architect**: a philosophy where UI is not "built" on a screen, but "carved" out of light and darkness.

By adhering to the **Kole Jain Manifest**, we move away from traditional skeuomorphism and flat material design. We utilize the 8pt spatial rhythm to create a sense of mathematical precision, while the zero-shadow mandate forces us to define depth through **Luminous Stratification**. Every element should feel like a projection on a high-end terminal—intentional, sharp, and chromatically pure.

---

### 2. Colors & The Chromatic Void
Our palette is rooted in the "Cyber Ocean" spectrum. We do not use grays; we use varying saturations of midnight navy to maintain a "Cyberpunk Blue" mood even in the darkest values.

#### The "No-Line" Rule
**Borders are prohibited for structural sectioning.** To separate a sidebar from a main feed, use a transition from `surface` (#0e131f) to `surface_container_low` (#161c27). If an edge feels "lost," increase the tonal contrast of the background rather than adding a stroke.

#### Surface Hierarchy & Nesting
Treat the UI as a series of submerged plates.
*   **Base Layer:** `surface` (#0e131f) - The infinite ocean floor.
*   **Primary Containers:** `surface_container` (#1a202b) - Standard content areas.
*   **Floating/Active UI:** `surface_container_highest` (#2f3541) - Elements that demand immediate focus.

#### The "Glass & Gradient" Rule
To achieve a premium, custom feel, use **Glassmorphism** for persistent navigation and overlays.
*   **Formula:** `surface_container` at 70% opacity + `backdrop-blur: 24px`.
*   **Signature Texture:** Use a subtle linear gradient on high-priority CTAs: `primary_container` (#00f2ff) to `primary_fixed_dim` (#00dbe7) at a 135-degree angle. This prevents the "flat cyan" look and adds a sense of energized light.

---

### 3. Typography: Space Grotesk
We use **Space Grotesk** exclusively. Its monospaced-influenced quirks provide the "Polymath" scientific aesthetic while maintaining excellent readability.

*   **Display (Lg/Md):** 3.5rem / 2.75rem. Use for data hero moments or landing headers. Letter-spacing: -0.02em.
*   **Headline (Sm):** 1.5rem. The primary "hook" for sections.
*   **Title (Md):** 1.125rem. Semi-bold. Used for card titles to ensure immediate hierarchy.
*   **Body (Md):** 0.875rem. Our workhorse. High line-height (1.6) is required to offset the high-contrast dark mode.
*   **Label (Sm):** 0.6875rem. All-caps with +0.1em letter spacing for "Terminal" style metadata.

---

### 4. Elevation & Depth: Tonal Layering
Traditional box-shadows are strictly forbidden (`box-shadow: none`). We communicate elevation through HSL (Hue, Saturation, Lightness) shifts.

*   **The Layering Principle:** A "raised" element is simply a "lighter" element. To make a card appear closer to the user, move it up the surface tier (e.g., from `surface_container` to `surface_container_high`).
*   **Ambient Glow (The Shadow Replacement):** When an element must "float" (like a Modal), use a `drop-shadow` filter with the `primary` color at 5% opacity. This mimics the light bleed of a high-end LED display rather than a physical shadow.
*   **The Ghost Border Fallback:** If accessibility requires a boundary, use `outline_variant` (#3a494b) at 15% opacity. It should be felt, not seen.

---

### 5. Components

#### Buttons
*   **Primary:** Background: `primary_container` (#00f2ff), Text: `on_primary` (#00363a). Weight: Bold. No border.
*   **Secondary:** Background: `transparent`, Border: `Ghost Border` (1px `outline_variant` @ 20%), Text: `primary`.
*   **Tertiary:** Background: `transparent`, Text: `secondary`. On hover, background becomes `surface_container_highest` @ 40%.

#### Inputs & Text Fields
*   **Structure:** No bottom line. Instead, use a filled `surface_container_lowest` container with a 0px radius (Hard edges).
*   **Focus State:** The background remains the same, but a 2px "Glow Bar" appears on the left edge using the `primary` token.

#### Cards & Lists
*   **Constraint:** Forbid divider lines. Use `spacing-8` (1.75rem) to separate list items. 
*   **Interaction:** On hover, a card should shift from `surface_container` to `surface_container_high`. This subtle "light up" effect is the core interaction language of the system.

#### Data Visualization (Polymath Exclusive)
*   **The "Pulse" Metric:** Use `primary` for active data streams. Use `tertiary` (#fff6e4) for warnings or "old" data to provide a high-contrast editorial break from the blue-heavy UI.

---

### 6. Do’s and Don’ts

#### Do:
*   **Do** embrace hard 0px corners. The "Cyber Ocean" is sharp and crystalline.
*   **Do** use asymmetrical layouts. Push a title to the far left and the body text to a 60% offset to create an editorial, non-templated look.
*   **Do** use `on_surface_variant` for secondary text to maintain a sophisticated low-contrast hierarchy.

#### Don’t:
*   **Don’t** use border-radius. Ever. 
*   **Don’t** use pure white (#FFFFFF). Always use `on_surface` (#dde2f3) to prevent eye strain in dark environments.
*   **Don’t** use standard "Blue" (#0000FF). Only use the specified Cyan and Navy HSL tokens to maintain the Cyberpunk Blue atmosphere.
*   **Don’t** stack more than three levels of surface containers. If you need a fourth level, you are over-complicating the information architecture.