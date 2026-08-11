---
name: LIBI DIAMONDS
description: Luminous diamond atelier with high-key surfaces and one midnight counterpoint
colors:
  diamond-white: "#ffffff"
  pearl-field: "#f7f7f3"
  porcelain: "#fdfdfb"
  midnight-ink: "#071a28"
  body-ink: "#253744"
  hairline: "#deded9"
  gilt: "#b5924b"
  gilt-deep: "#7c5d28"
typography:
  display:
    fontFamily: "Frank Ruhl Libre, serif"
    fontSize: "clamp(3rem, 5.2vw, 5.8rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Assistant, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Assistant, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.045em"
rounded:
  square: "0px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "32px"
  lg: "64px"
  xl: "128px"
components:
  button-primary:
    backgroundColor: "{colors.midnight-ink}"
    textColor: "{colors.diamond-white}"
    rounded: "{rounded.square}"
    padding: "14px 35px"
  product-tray:
    backgroundColor: "{colors.pearl-field}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.square}"
  header:
    backgroundColor: "{colors.diamond-white}"
    textColor: "{colors.midnight-ink}"
    rounded: "{rounded.square}"
    height: "64px"
---

# Design System: LIBI DIAMONDS

## Overview

**Creative North Star: "The Luminous Atelier Folio"**

LIBI presents jewelry as if it were being examined on a jeweler's light table: bright, calm, exact and free of decorative chrome. Real photography carries the material richness. The interface contributes white space, fine ink lines and decisive typography, then steps back.

Midnight ink appears primarily in text, controls and one immersive virtual try-on passage. This single inversion gives the scroll drama without making the whole storefront feel dark.

**Key Characteristics:**

- Diamond-white page fields with pearl-toned product trays.
- Large Hebrew display typography paired with quiet utility text.
- Flat, square-edged compositions with hairline separation.
- One dark experiential counterpoint per long commerce surface.
- Real jewelry and atelier photography, never simulated decorative material.

## Colors

The palette is restrained: near-whites carry most of every screen, midnight provides authority, and gilt is used only as a small optical accent.

### Primary

- **Midnight Ink:** Primary text, decisive controls and the virtual try-on field.

### Secondary

- **Hairline Gilt:** Focused dividers, selected details and small signature geometry; never a large fill.

### Neutral

- **Diamond White:** Main page and navigation surface.
- **Pearl Field:** Product trays and quiet content separation.
- **Porcelain:** Secondary light panels where a warmer boundary is useful.
- **Body Ink:** Explanatory copy and supporting labels.
- **Hairline:** Rules, tray boundaries and structural dividers.

**The Light Majority Rule.** Near-white surfaces occupy the clear majority of every commerce page; midnight is rare enough to remain meaningful.

**The Hairline Gilt Rule.** Gold marks selection and craft at small scale. It never becomes a decorative background.

## Typography

**Display Font:** Frank Ruhl Libre (serif)

**Body Font:** Assistant (sans-serif)

**Character:** The display face brings a distinctly Hebrew editorial voice, while Assistant keeps configuration, prices and service copy practical and legible.

### Hierarchy

- **Display** (400, fluid up to 5.8rem, 0.98): Hero and major section statements; keep line breaks intentional and short.
- **Headline** (400–500, 2–4.8rem, about 1): Collection and editorial headings.
- **Title** (400–500, 1–1.5rem): Product names and supporting stories.
- **Body** (400, 1rem, 1.8): Explanatory content; keep readable measures around 65–75 characters.
- **Label** (600, 0.8rem, tracked): Navigation, actions, prices and configuration labels.

**The One Display Voice Rule.** Frank Ruhl Libre owns expressive hierarchy; utility copy stays in Assistant instead of introducing additional decorative faces.

## Layout

Desktop uses a wide editorial shell up to roughly 94rem. The hero is a crisp split between image and message, while category discovery uses a 12-column mosaic: one dominant ring field, two smaller study fields and one wide collection field. Product selections use an editorial rail rather than equal-card repetition.

Mobile stacks the same content into a direct reading order with 16px side gutters and at least 44px controls. Photography remains large; supporting items become compact rows where that reduces scrolling. The 1024px breakpoint changes composition, not merely scale.

Sections use generous vertical rhythm, with more space before a new idea than between its heading and content. Long pages alternate image density, quiet white fields and one dark experiential passage.

## Elevation & Depth

The system is flat by default. Depth comes from real photographic lighting, tonal fields and occasional inset hairlines. Product cards may gain one soft ambient shadow on hover, but resting cards, navigation, footer and editorial panels remain unlifted.

**The Flat Light-Table Rule.** A surface does not receive both a visible border and a resting shadow. Structural separation is normally a one-pixel line.

## Shapes

Major surfaces, image frames, buttons and controls use square corners. The recurring diamond is a small 45-degree square used in signatures and selected states. Circular forms are reserved for physical color swatches, range thumbs and familiar icons.

## Components

### Buttons

- **Shape:** Square and architectural.
- **Primary:** Midnight background, diamond-white text and generous horizontal padding.
- **Hover / Focus:** Shift to a slightly lighter ink blue; keyboard focus remains clearly visible.
- **Text action:** A quiet underline or hairline rule replaces a secondary button container.

### Cards / Containers

- **Corner Style:** Square.
- **Background:** White or pearl field.
- **Shadow Strategy:** None at rest; soft ambient lift only as an interactive response.
- **Border:** One translucent ink hairline when separation is required.
- **Internal Padding:** Kept outside the image whenever possible so jewelry photography remains uninterrupted.

### Navigation

The header is translucent white over a hairline divider. Navigation uses small Assistant labels and a centered LIBI wordmark. Hover is indicated by a fine growing underline; mobile uses a full-screen white menu with generous touch targets.

### Product Tray

Products sit on a nearly white optical field with a restrained central light bloom and a physical shadow belonging to the photographed jewelry. Yellow and white metal share the same background world so catalog comparison remains stable.

### Virtual Try-On Passage

This is the single immersive midnight section. It pairs a large real product image with one short promise and a bordered action, then returns immediately to the light page world.

## Do's and Don'ts

### Do:

- **Do** give jewelry photography more area than interface chrome.
- **Do** use white space, scale and reading order before adding containers.
- **Do** reserve gilt for hairlines, selection and signature geometry.
- **Do** verify the 390px mobile composition and desktop composition independently.
- **Do** keep factual prices, materials, certificates and service claims sourced from product data.

### Don't:

- **Don't** rebuild the storefront from equal beige cards with layered shadows.
- **Don't** place consecutive full-width dark sections on a commerce page.
- **Don't** add decorative kickers above headings or invented luxury copy.
- **Don't** use gradients or texture to imitate jewelry, paper, stone or metal when a real image should carry the material.
- **Don't** let gold become a large background or dominant text color.
