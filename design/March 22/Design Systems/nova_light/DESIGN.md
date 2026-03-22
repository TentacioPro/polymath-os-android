# Design System Specification: Editorial Precision

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is not a utility; it is a statement of intent. Inspired by the Kole Jain manifest, it rejects the "template-heavy" look of modern SaaS in favor of a high-end, editorial aesthetic. 

**The Creative North Star: The Digital Curator.** 
We treat every screen like a spread in a premium architecture monograph. The system moves away from rigid, boxed-in grids toward **intentional asymmetry** and **tonal depth**. By utilizing extreme whitespace and high-contrast typography, we create a sense of "quiet authority." We do not guide the user with loud buttons; we guide them with superior information hierarchy and sophisticated spatial rhythm.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a monochromatic "Slate & Bone" foundation. It utilizes a high-contrast primary (`#000000`) against a pure white base to command attention.

### The "No-Line" Rule
**Borders are a failure of layout.** To maintain the editorial aesthetic, 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through:
1.  **Background Color Shifts:** Placing a `surface-container-low` section against a `surface` background.
2.  **Negative Space:** Using the 8pt spatial rhythm to create "invisible" corridors of separation.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine vellum.
*   **Base Layer:** `surface` (#f9f9f9) or `surface-container-lowest` (#ffffff).
*   **Secondary Layer:** `surface-container` (#eeeeee) for sidebars or utility panels.
*   **Floating Elements:** Use `surface-bright` (#f9f9f9) with a 40% opacity and a `20px` backdrop-blur to create "Glassmorphism" for navigation bars or modals.

### Signature Textures
To avoid a "flat" feel, use subtle gradients for primary CTAs:
*   **Action Gradient:** Transitioning from `primary` (#000000) to `primary-container` (#3c3b3b) at a 135-degree angle. This adds "soul" and a tactile, premium quality.

---

## 3. Typography: Space Grotesk
Typography is our primary tool for expression. Space Grotesk’s geometric quirks provide a "tech-forward" yet humanistic feel.

*   **Display (lg/md):** Used sparingly. Set with tight letter-spacing (-2%) to feel like a masthead.
*   **Headline (lg/md):** The workhorse for editorial sections. Use `headline-lg` (2rem) for entry points, ensuring at least `24` (8.5rem) of whitespace above it.
*   **Body (lg/md):** Always use `on-surface-variant` (#474747) for long-form reading to reduce eye strain and increase the "premium" feel. Pure black text is reserved for titles and headers only.
*   **Labels:** Use `label-md` in all-caps with +5% letter-spacing for a "caption" look inspired by museum placards.

---

## 4. Elevation & Depth
We reject traditional drop shadows. Depth is achieved through **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift without the "dirty" look of grey shadows.
*   **Ambient Shadows:** If a floating state is required (e.g., a dropdown), use an ultra-diffused shadow: `0px 20px 40px rgba(26, 28, 28, 0.04)`. The shadow must be tinted with the `on-surface` color, never pure black.
*   **The "Ghost Border":** For essential accessibility in input fields, use `outline-variant` (#c6c6c6) at **20% opacity**. It should be felt, not seen.

---

## 5. Components & Primitive Styling

### Buttons: The Editorial Trigger
*   **Primary:** Solid `primary` (#000000) with `on-primary` (#e5e2e1) text. Shape: `DEFAULT` (1rem roundness). No icons unless they signify a directional action (e.g., an arrow).
*   **Secondary:** `surface-container-high` (#e8e8e8) background. No border.
*   **Tertiary:** Underlined `title-sm` typography. The underline should sit 4px below the baseline.

### Input Fields: Minimalist Frames
*   **Styling:** No background. Only a bottom border using `outline-variant` at 40% opacity. 
*   **Focus State:** The bottom border transitions to `primary` (#000000) at 2px thickness. Label moves to `label-sm` style.

### Cards & Lists: The Separation Rule
*   **Forbid Divider Lines:** Use `10` (3.5rem) or `12` (4rem) spacing to separate list items. 
*   **Cards:** Do not use borders. Use `surface-container-lowest` (#ffffff) on top of `surface-container` (#eeeeee).

### The "Curated" Component: The Breadcrumb Trace
*   Instead of a traditional breadcrumb, use a `label-sm` horizontal list with `0.5` (0.175rem) spacers. It should look like a line of code or a file path, emphasizing the "Polymath" OS technical heritage.

---

## 6. Do’s and Don’ts

### Do
*   **Embrace Asymmetry:** Align a headline to the left and the body text to a column starting at 60% of the container width.
*   **Use Massive Whitespace:** If you think there is enough space, add `8` (2.75rem) more.
*   **Leverage Tonal Shifts:** Use the `surface-container` scales to group related items instead of drawing a box around them.

### Don’t
*   **No 1px Lines:** Do not use dividers to separate content. Use the spatial rhythm.
*   **No High-Saturation Colors:** Avoid any color not in the provided palette. If an "Alert" is needed, use `error_container` (#ffdad6) with `on-error-container` (#410002) text—keep it sophisticated, not "loud."
*   **No Standard Shadows:** Never use the default "Drop Shadow" settings in design tools. Always blur more than you think, and lower the opacity more than you think.