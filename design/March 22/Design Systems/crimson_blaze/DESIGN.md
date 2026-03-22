```markdown
# Design System Specification: Polymath OS

## 1. Creative North Star: "The Kinetic Ember"
This design system is not a static interface; it is a high-performance environment that mimics the behavior of controlled thermal energy. We move away from the "boxy" nature of standard SaaS platforms toward **Digital Brutalism**. The aesthetic is defined by extreme high-contrast typography, razor-sharp edges, and a rejection of traditional depth markers like shadows and borders. 

By utilizing a "Crimson-Black" foundation, we create an atmosphere of intense focus. We do not use depth to simulate physical cards; we use HSL-based tonal shifts to simulate heat. The closer an element is to the user, the more "incandescent" (lighter/redder) its surface becomes.

---

## 2. Color Architecture & The Thermal Rule
We operate on a spectrum of cooling embers to white-hot intensity. 

### The "No-Line" Rule
**Prohibit all 1px solid borders for sectioning.** Structural boundaries must be defined exclusively through background color shifts. To separate a sidebar from a main content area, use `surface_container_low` against `surface`. If a component needs to stand out, change its "temperature" (tonal value), not its stroke.

### Surface Hierarchy (HSL Thermal Layering)
Layering is achieved by nesting containers of varying lightness.
- **Base Layer:** `surface` (#1f0f0f) – The cooling floor.
- **Secondary Layouts:** `surface_container_low` (#281717) – Subtle structural separation.
- **Actionable Containers:** `surface_container` (#2d1b1b) – Standard "card" equivalent.
- **Active/Hover States:** `surface_container_high` (#382525) – A visual "heat" increase.

### Signature Textures & Gradients
To avoid a "flat" digital look, use **Vignette Gradients** on large surfaces. 
*   **Hero Sections:** Transition from `surface_container_lowest` (#190a0a) at the edges to a center-glow of `primary_container` (#ff5352) at 5% opacity.
*   **CTAs:** Use a linear gradient from `primary` (#ffb3ae) to `primary_container` (#ff5352) at a 135-degree angle to provide "soul" and directional energy.

---

## 3. Typography: Space Grotesk Editorial
Space Grotesk’s idiosyncratic terminals and geometric construction are the backbone of this system. We treat type as a graphical element, not just a legibility tool.

*   **Display (lg/md):** Reserved for core brand moments and high-impact data. Letter-spacing should be set to `-0.04em` to create a dense, "heavy" visual weight.
*   **Headlines:** Used for section starts. Always sentence case. Never use bold; let the scale (3.5rem to 1.5rem) communicate the hierarchy.
*   **Body (lg/md):** Optimized for technical reading. Letter-spacing `+0.01em`. 
*   **Labels (md/sm):** Always Uppercase with `+0.1em` tracking. These act as "technical annotations" within the OS.

---

## 4. Elevation & Zero-Shadow Depth
In accordance with the Kole Jain manifest, **zero box-shadows are permitted.** We replace "Physical Shadow" with "Luminance Elevation."

### The Layering Principle
Depth is a result of HSL stacking:
1.  **Level 0 (Background):** `surface_dim` (#1f0f0f)
2.  **Level 1 (Sections):** `surface_container_low` (#281717)
3.  **Level 2 (Interaction):** `surface_container_highest` (#44302f)

### The "Ghost Border" Fallback
If accessibility requirements (WCAG) demand a boundary that color-shifting cannot solve, use a **Ghost Border**: `outline_variant` (#5b403e) at **15% opacity**. It should be felt, not seen.

### Glassmorphism
For floating overlays (Modals, Tooltips, Context Menus), use:
*   **Fill:** `surface_container_highest` at 70% opacity.
*   **Backdrop Blur:** 20px.
*   **Result:** This creates a "smoldering glass" effect where the crimson background bleeds through the component.

---

## 5. Primitive Components

### Buttons
*   **Primary:** Solid `primary` (#ffb3ae) background, `on_primary` (#68000b) text. 0px corner radius. No border.
*   **Secondary:** `surface_container_highest` background. Sharp 90-degree corners.
*   **Tertiary:** Ghost style. No background, `primary` text, `outline_variant` at 10% opacity only on hover.

### Input Fields
*   **Default:** `surface_container_lowest` fill. No bottom border. 
*   **Focus:** Background shifts to `surface_container_high`. Text color remains `on_surface`.
*   **Error:** Background shifts to `error_container` (#93000a) at 20% opacity.

### Lists & Cards
*   **Forbid Dividers:** Use the 8pt spatial rhythm (e.g., `spacing.8` or `2rem`) to separate list items. 
*   **Hover Interaction:** The entire list item background should transition to `surface_container_high` instantly (0ms duration) to mimic an electronic switch.

### Tactical Data Chips
*   Small, rectangular blocks of `secondary_container` (#842928) with `label-sm` text. Used for status indicators and metadata.

---

## 6. Do’s and Don’ts

### Do
*   **Embrace the Void:** Use large amounts of `surface_container_lowest` to create a sense of infinite digital space.
*   **Be Sharp:** Maintain 0px radius on everything. Soft corners dilute the "incendiary" mood of the system.
*   **Use Intentional Asymmetry:** Align text to the far left and data points to the far right with massive horizontal gaps to create an editorial feel.

### Don’t
*   **No Soft Grays:** Never use neutral grays (e.g., #808080). All neutrals must be "Crimson-Black" (tinted with red).
*   **No Rounding:** Do not use `rounded-md` or `rounded-full` for buttons or tags.
*   **No Transitions:** For hover states, avoid "slow" fades (e.g., 300ms). Use 0ms or 50ms for a "snappy," high-performance OS sensation.
*   **No Shadows:** Even for modals. Use a 40% `surface_container_lowest` overlay on the background to "push" the modal forward instead.