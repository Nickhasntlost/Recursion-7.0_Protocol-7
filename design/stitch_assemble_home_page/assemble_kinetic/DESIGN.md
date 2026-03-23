```markdown
# Design System Document: High-End Event Editorial

## 1. Overview & Creative North Star
**Creative North Star: The Digital Curator**
This design system is not merely a booking utility; it is a curated gallery of experiences. To achieve a premium, high-end feel, we move away from traditional "app" layouts characterized by dense grids and rigid borders. Instead, we embrace **Editorial Asymmetry**.

By utilizing expansive whitespace, overlapping "floating" containers, and dramatic typographic scales, we create an environment that feels intentional and bespoke. This system mimics the physical depth of layered fine-paper and frosted glass, ensuring every event feels like a marquee occasion.

---

## 2. Colors
Our palette is rooted in sophisticated neutrals with a singular, high-energy punctuation mark.

| Token | Hex | Role |
| :--- | :--- | :--- |
| **Primary** | `#000000` | High-contrast text and primary CTA foundations. |
| **Secondary** | `#5B6300` | Functional accents; grounded sophisticated green. |
| **Secondary Container** | `#DFEB72` | Our "Electric Lime" accent; used for highlights and critical focus. |
| **Surface** | `#F9F9F9` | The base canvas; soft, off-white to reduce eye strain. |
| **Surface Container Low** | `#F3F3F3` | Secondary layering for subtle depth. |
| **Surface Container High** | `#E8E8E8` | Prominent UI elements and card backgrounds. |

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** 
Structural boundaries must be defined solely through background color shifts. To separate the header from the hero, or a card from the background, use a transition from `surface` to `surface-container-low`. Lines are "artifacts" of old web design; tonal shifts are the hallmarks of modern premium UI.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to define importance:
- **Base Level:** `surface` (#F9F9F9).
- **In-Page Sections:** `surface-container-low` (#F3F3F3).
- **Floating Cards/Modals:** `surface-container-lowest` (#FFFFFF) to create a natural "lift."

### The "Glass & Gradient" Rule
For overlays, navigation bars, or event tags, use **Glassmorphism**.
- **Background:** `rgba(255, 255, 255, 0.7)`
- **Effect:** `backdrop-blur: 20px;`
- **CTA Soul:** Apply a subtle linear gradient to main buttons, transitioning from `primary` (#000000) to `primary-container` (#1C1B1B). This adds a "weighted" feel that flat hex codes lack.

---

## 3. Typography
We use a high-contrast pairing to balance authority with approachability.

*   **Display & Headlines (Plus Jakarta Sans):** Our "Voice." Bold, wide, and modern. Use `display-lg` (3.5rem) for hero sections with tight letter-spacing (-0.02em) to create a premium editorial look.
*   **Body & Titles (Inter):** Our "Information." Clean, highly legible, and neutral. 
*   **Visual Hierarchy:** Headlines should be significantly larger than body text. A 4:1 ratio between `display-sm` and `body-md` is encouraged to create a sense of scale and luxury.

---

## 4. Elevation & Depth
Depth in this design system is achieved through **Tonal Layering** rather than traditional drop shadows.

### The Layering Principle
Achieve lift by stacking colors. A `surface-container-lowest` (#FFFFFF) card placed on a `surface-container-high` (#E8E8E8) background creates a crisp, clear elevation without a single shadow pixel.

### Ambient Shadows
When a "floating" effect is mandatory (e.g., a floating booking bar):
- **Blur:** `32px` to `64px`.
- **Opacity:** 4% – 8%.
- **Color:** Tint the shadow with the `on-surface` color (#1A1C1C) rather than pure black to ensure the shadow feels like a natural lighting effect.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input fields), use the `outline-variant` token at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons
- **Primary:** Rounded `full`. Background: `primary`. Text: `on-primary`. Include a trailing arrow icon `→` for "Start" or "Book" actions to imply movement.
- **Secondary (Glass):** Semi-transparent `surface-container-lowest` with backdrop-blur. 
- **Sizing:** Large vertical padding (spacing `3` or `3.5`) to ensure a "touch-first" premium feel.

### Cards & Lists
- **The Forbiddance:** Never use divider lines between list items or card sections.
- **The Alternative:** Use spacing `6` (2rem) as a vertical gutter between content blocks.
- **Corner Radius:** Use `xl` (3rem) for large image containers and `lg` (2rem) for standard content cards. This "super-ellipse" feel mimics high-end hardware.

### Input Fields
- **Style:** Minimalist. No bottom line or box. Use `surface-container-low` as a subtle background fill with `md` (1.5rem) rounded corners.
- **Focus State:** Background shifts to `surface-container-lowest` with a "Ghost Border" of `secondary-container`.

### Event Chips
- Use the `secondary-fixed` (#DFEB72) background for "Featured" or "New" events. Use `label-md` in `on-secondary-fixed` (#1A1D00) for high-contrast legibility.

---

## 6. Do’s and Don’ts

### Do
- **Do** use intentional asymmetry. Overlap an image card slightly over a text block.
- **Do** maximize whitespace. If it feels like "too much," it is likely just enough for a premium feel.
- **Do** use `9999px` (full) rounding for small elements like tags, buttons, and status indicators.

### Don't
- **Don't** use pure black #000000 for body text; use `on-surface-variant` (#444748) for a softer, editorial tone.
- **Don't** use standard "box-shadow" presets. Always customize for maximum diffusion.
- **Don't** clutter the screen with icons. Use icons only when they provide a clear functional affordance or a specific brand "moment."
- **Don't** use 1px dividers. If you need a break, use a `surface-dim` background change.```