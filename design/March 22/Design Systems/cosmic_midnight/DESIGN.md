# Design System Document: The Obsidian Instrument Strategy

## 1. Overview & Creative North Star: "The Synthetic Void"
This design system rejects the "web-as-a-document" tradition in favor of the "interface-as-an-instrument" philosophy. Our Creative North Star is **The Synthetic Void**: a high-performance, obsidian-glass environment where data doesn't sit *on* a page, but floats within a deep, violet vacuum. 

To achieve this, we move away from standard container-based layouts. We utilize aggressive typography scaling, intentional asymmetry, and "glassmorphism" to create a sense of infinite depth. By strictly adhering to a `0px` border-radius and `0px` box-shadow constraint, we embrace a "High-Definition Brutalism"—relying on color luminosity and HSL-based elevation to guide the user’s eye.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the `surface` (#110b1c), a deep "Purple Void" that serves as our absolute dark. Hierarchy is dictated not by light, but by *energy* (chroma).

### The "No-Line" Rule
**Borders are prohibited for layout sectioning.** Do not use 1px strokes to separate a sidebar from a main view. Instead, use background shifts:
*   **Sidebar:** `surface_container_low` (#171023)
*   **Main Workspace:** `surface` (#110b1c)
*   **Active Modals/Overlays:** `surface_bright` (#312742) with a backdrop blur.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of obsidian. 
*   **Base Layer:** `surface_dim` (#110b1c)
*   **In-Page Sections:** `surface_container` (#1d162b)
*   **Floating Elements:** `surface_container_highest` (#2a213a)
*   **The "Glass & Gradient" Rule:** For primary actions or hero elements, use a linear gradient from `primary` (#ff7cf5) to `primary_container` (#ff5af9) at a 135-degree angle. This injects "neon soul" into the otherwise cold, dark void.

---

## 3. Typography: Editorial Cyberpunk
We pair the geometric, technical character of **Space Grotesk** with the utilitarian precision of **Inter**.

*   **Display (Space Grotesk):** Used for massive, high-contrast data points or section titles. Use `display-lg` (3.5rem) with -2% letter spacing to create an authoritative, "terminal" aesthetic.
*   **Headlines (Space Grotesk):** Use `headline-md` (1.75rem) for navigation headers. These should always be `on_surface` (#ece1fa).
*   **Body (Inter):** All long-form reading and functional labels. `body-md` (0.875rem) is the workhorse. Inter’s neutrality balances the aggressive nature of the headings.
*   **Labels (Inter):** Use `label-sm` (0.6875rem) in All Caps with +5% letter spacing for metadata and "system status" indicators.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are forbidden (`0px` box-shadows). Depth is simulated through HSL-based tonal shifts and transparency.

*   **The Layering Principle:** Place a `surface_container_lowest` (#000000) element inside a `surface_container` (#1d162b) area to create a "recessed" or "carved" effect.
*   **Glassmorphism:** For floating menus or tooltips, use `surface_bright` at 60% opacity with a `20px` backdrop-blur. This mimics the "Obsidian Glass" aesthetic.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use the `outline_variant` (#4c4458) at **15% opacity**. It should be felt, not seen.
*   **Neon Glow:** To highlight an active state, instead of a shadow, use a subtle 1px "outer glow" created by a semi-transparent `primary` stroke, or a tiny HSL luminosity bump of the surface color.

---

## 5. Components: The Obsidian Suite

### Buttons
*   **Primary:** Solid `primary` (#ff7cf5). Text is `on_primary` (#580058). Shape: Strict 90-degree corners (`0px` radius).
*   **Secondary:** No fill. `Ghost Border` (15% opacity `outline_variant`). Text is `primary`.
*   **Tertiary:** No fill, no border. Text is `primary`. Underline on hover only.

### Input Fields
*   **Style:** Recessed styling. Background: `surface_container_lowest`. 
*   **Active State:** Bottom border only (2px) in `primary` (#ff7cf5). 
*   **Error State:** Background shifts to a 5% opacity tint of `error` (#ff6e84).

### Cards & Lists
*   **The Divider Ban:** Never use horizontal rules. Separate list items using the spacing scale (e.g., `spacing.4` / 0.9rem) or by alternating background tones between `surface_container_low` and `surface_container`.
*   **Interactive Cards:** On hover, shift the background from `surface_container` to `surface_container_high`.

### Terminal Chips
*   Small, rectangular blocks. Background: `secondary_container` (#7000ff). Text: `on_secondary_container` (#f8f1ff). Use for tags or status codes.

---

## 6. Do's and Don'ts

### Do
*   **DO** use extreme whitespace. Use `spacing.20` (4.5rem) to separate major functional blocks.
*   **DO** use asymmetry. Align a headline to the far left and the body text to a 60% offset grid to create an editorial feel.
*   **DO** treat the `primary` Fuchsia as "energy." Use it sparingly for maximum impact (CTAs, critical alerts, active states).

### Don't
*   **DON'T** use rounded corners. Every element in this system must be hard-edged (`0px`).
*   **DON'T** use grey. Our neutrals are always tinted with violet (`surface_variant`).
*   **DON'T** use standard 12-column grids for everything. Use the 8pt scale to create "staggered" layouts that feel like a high-end instrument dashboard.

---

## 7. Spacing Scale (8pt Driven)
All layout logic must follow the 0.1rem (approx 1.6px) increment system. 
*   **Tight (XS):** `spacing.2` (0.4rem) - For internal component padding.
*   **Standard (M):** `spacing.5` (1.1rem) - For content gaps.
*   **Extreme (XL):** `spacing.16` (3.5rem) - For section breathing room.