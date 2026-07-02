---
name: Sassy Lash & Skin
description: Warm, personality-forward booking for a boutique lash studio.
colors:
  warm-garnet: "#F43F5E"
  warm-garnet-deep: "#E11D48"
  warm-garnet-border: "#FB7185"
  blushed-petal: "#FFF1F2"
  petal-border: "#FECDD3"
  cream-canvas: "#FAFAF9"
  warm-white: "#FFFFFF"
  deep-walnut: "#292524"
  driftwood: "#78716C"
  fog: "#A8A29E"
  chalk: "#E7E5E4"
  ash: "#F5F5F4"
  error-surface: "#FEF2F2"
  error-text: "#B91C1C"
typography:
  display:
    fontFamily: "Figtree, Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Figtree, Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Figtree, Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.warm-garnet}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.warm-garnet-deep}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-disabled:
    backgroundColor: "#FDA4AF"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-selection-default:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.deep-walnut}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  button-selection-selected:
    backgroundColor: "{colors.blushed-petal}"
    textColor: "{colors.warm-garnet}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  input-default:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.deep-walnut}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  service-card:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.deep-walnut}"
    rounded: "{rounded.md}"
    padding: "20px"
  service-card-selected:
    backgroundColor: "{colors.blushed-petal}"
    textColor: "{colors.deep-walnut}"
    rounded: "{rounded.md}"
    padding: "20px"
  booking-summary:
    backgroundColor: "{colors.blushed-petal}"
    textColor: "{colors.deep-walnut}"
    rounded: "{rounded.sm}"
    padding: "16px"
---

# Design System: Sassy Lash & Skin

## 1. Overview

**Creative North Star: "The Local Gem"**

The booking interface for Sassy Lash & Skin is not a scheduling tool that happens to have a logo. It is a first impression of a business with personality: warm, real, a little particular, and clearly good at what it does. Regulars should feel at home. New clients should feel like they found something worth booking. Every design decision answers to that.

The palette is warm neutrals carrying the surface, with rose woven through every moment of touch: selections, confirmations, focus rings, the CTA. Not a shy accent, not a hero color. Rose is at 35-50% of interactive elements because warmth is the booking experience. Typography pairs Figtree (slightly expressive, warm geometric sans) at headings with Inter at body. The contrast between the two adds character without noise.

This system explicitly rejects: the corporate blue grid-table aesthetic of Calendly and Acuity (sterile, impersonal), cheap-feminine design (pink glitter, everything in script fonts, clip-art florals, low-budget), and anything moody or dark (this is a joyful errand). It should feel like a shop that earned its regulars and doesn't need to prove it.

**Key Characteristics:**
- Warm neutral foundation (stone) with rose woven through all interactive and highlight states
- Two-font system: expressive display sans (Figtree) at headings, Inter at body
- Flat elevation: depth through border shifts and tonal backgrounds, never shadows
- Progressive disclosure layout (service, date, time, form) feels like steps, not a form
- Mobile-first: most clients book on their phones; touch targets always 44px minimum

## 2. Colors: The Warm Garnet Palette

A warm-neutral foundation with a rose accent that shows up wherever a client is making a choice.

### Primary
- **Warm Garnet** (#F43F5E / oklch(64% 0.24 12)): The primary accent. CTA button fill, selected state borders, focus ring. Strong enough to command action; never used decoratively on static surfaces.
- **Warm Garnet Deep** (#E11D48 / oklch(57% 0.245 13)): Button hover only. Not used as a standalone color elsewhere.
- **Warm Garnet Border** (#FB7185 / oklch(72% 0.20 13)): Selected-state borders on all interactive elements (service cards, date buttons, slot buttons).

### Secondary
- **Blushed Petal** (#FFF1F2 / oklch(97% 0.025 9)): The activated background. Selected service cards, date buttons, slot buttons, and the booking summary all use this. Rose's softest expression.
- **Petal Border** (#FECDD3 / oklch(89% 0.09 13)): Hover-state borders on interactive elements. The gentle precursor to Warm Garnet Border.

### Neutral
- **Cream Canvas** (#FAFAF9): Page background. Barely warm off-white; never true white as the base.
- **Warm White** (#FFFFFF): Card and form surfaces. One step lighter than canvas.
- **Deep Walnut** (#292524): Primary text. Never pure black.
- **Driftwood** (#78716C): Muted body text, descriptions, secondary information.
- **Fog** (#A8A29E): Placeholder text, timestamps, ultra-secondary labels.
- **Chalk** (#E7E5E4): Borders and dividers. The edge between surfaces.
- **Ash** (#F5F5F4): Skeleton and loading state backgrounds.

### Error
- **Error Surface** (#FEF2F2): Error message background.
- **Error Text** (#B91C1C): Error message copy.

**The Woven Rose Rule.** Rose is not a hero color and not a shy accent. It lives on all interactive elements in their selected, focused, and active states. Its warmth is the booking experience. Do not reduce it to a single CTA button.

**The Warm Foundation Rule.** Never use pure white (#FFFFFF) as the page background. Cream Canvas (#FAFAF9) is the base; Warm White is for cards set against it.

## 3. Typography

**Display/Heading Font:** Figtree (weights 600, 700)
**Body Font:** Inter (weights 400, 500, 600)

**Character:** Warm precision. Figtree has just enough roundness and personality at display sizes to feel boutique without being ornate. Inter at body reads cleanly on mobile. The two fonts feel like different registers of the same voice: one for inviting, one for informing.

### Hierarchy
- **Display** (Figtree 700, 1.5rem, lh 1.2, tracking -0.025em): Page title only ("Sassy Lash & Skin"). One instance per view.
- **Headline** (Figtree 700, 1.25rem, lh 1.3): Admin section headings, confirmation h1.
- **Title** (Figtree 600, 1.125rem, lh 1.4): Service card names, single-sentence component labels.
- **Body** (Inter 400, 0.875rem, lh 1.6): Descriptions, form labels, instructions. Max 65ch line length.
- **Label** (Inter 600, 0.75rem, lh 1, tracking +0.05em, UPPERCASE): Step labels ("1. SELECT A SERVICE"), small metadata, duration badges.

### Named Rules
**The Double-Voice Rule.** Use Figtree (display, headline, title) when the client reads about a choice. Use Inter (body, label) when they read instructions or form data. Never mix within a single semantic block.

**The Scale Rule.** Minimum ratio between adjacent hierarchy steps is 1.25. No flat type scales. The display header should feel noticeably larger than the section label.

## 4. Elevation

This system is flat by default. No box shadows anywhere in the current implementation, and none are needed. Depth is achieved through three mechanisms, in order of preference:

1. **Surface layering**: Cream Canvas (page) underneath Warm White (cards) underneath Blushed Petal (selected state). Each step is visible without any shadows.
2. **Border shifts**: Unselected (Chalk, 1-2px) to hover (Petal Border) to selected (Warm Garnet Border). The border carries the state; no elevation needed.
3. **Tonal containment**: The booking summary uses Blushed Petal fill plus Petal Border to feel contained and highlighted without any shadow.

**The Flat-By-Default Rule.** If you reach for `box-shadow`, stop. Solve with a border shift or background tint. Shadows are not prohibited, but none have been needed in this system, and that is the point.

## 5. Components

### Buttons
- **Shape:** Gently rounded (12px). Feels touchable. Not corporate pill, not sharp rectangle.
- **Primary (CTA):** Warm Garnet (#F43F5E) fill, white text, 12px 24px padding, full-width on mobile.
- **Hover:** Warm Garnet Deep (#E11D48). 150ms ease-out color transition. No transform.
- **Disabled:** Rose-300 fill (#FDA4AF). Same shape. No pointer-events.
- **Ghost selection buttons (slots, dates):** Border (1px Chalk) + Warm White at rest. Border (2px Warm Garnet Border) + Blushed Petal when selected. Border (1px Petal Border) on hover.

### Service Cards
- **Corner Style:** Gently rounded (12px).
- **Unselected:** Warm White background, 2px Chalk border. Clean, inviting.
- **Hover:** 2px Petal Border. Gentle telegraphing.
- **Selected:** Blushed Petal background, 2px Warm Garnet Border. Immediately clear.
- **Internal Padding:** 20px.
- **Border:** 2px (heavier than inputs to signal a selection affordance).

### Date + Slot Selectors
- **Style:** Compact border buttons, 8px radius, grid layout (4 cols mobile / 7 cols desktop for dates; 3 cols mobile / 4 cols desktop for slots).
- **States:** Identical to service cards at smaller scale: Chalk to Petal Border to Warm Garnet Border.
- **Character:** Feels like a calendar you can touch, not a data table.

### Inputs / Fields
- **Style:** Warm White background, 1px Chalk border, 8px radius. 8px 12px internal padding.
- **Focus:** 2px Warm Garnet Border ring (box-shadow, not outline), offset 0. The ring appears without a border color change.
- **Labels:** Inter 600 0.875rem, Deep Walnut. Sits 4px above the input.

### Booking Summary Block
- **Style:** Blushed Petal fill, 1px Petal Border, 8px radius, 16px padding.
- **Typography:** Service name in Title weight (Figtree 600), datetime in rose-600.
- **Role:** Confirmation before the form. The most color-dense element on the page. Intentional.

### Navigation (Header)
- **Booking page header:** Warm White background, 1px bottom Chalk border. Brand name centered in Display. Subtitle in Driftwood.
- **Admin nav:** Same white/chalk treatment. Navigation links in Driftwood, plain text. No active indicator color.

### Step Labels
- **Style:** Inter 600 0.75rem uppercase, letter-spacing +0.05em, Fog (#A8A29E). Sits above each section.
- **Role:** Orients the client within the progressive flow without visual weight.

## 6. Do's and Don'ts

### Do:
- **Do** use Figtree for all headings, service names, card titles, and the page title. Keep Inter for body copy, form labels, step labels, and metadata.
- **Do** let rose show up at every moment of client engagement: hover borders, selected borders, focus rings, the CTA button, the booking summary. Warmth is the point.
- **Do** use Cream Canvas (#FAFAF9) as the page base. Never pure white as the background.
- **Do** design for mobile first. Touch targets 44px minimum. Most clients book on their phones.
- **Do** use 2px borders on service cards. The weight signals "selection affordance," not just a visual container.
- **Do** keep elevation flat. Solve depth with border shifts and tonal backgrounds before reaching for shadows.
- **Do** keep step labels small, uppercase, and Fog-colored. They orient without competing.

### Don't:
- **Don't** design this like Calendly or Acuity. No corporate blue, no grid-heavy tables, no "scheduling software" feel. This should feel like the studio, not the tool.
- **Don't** use pink glitter, script fonts for body or UI copy, clip-art florals, or obvious cheap-feminine patterns. Luxe, not dollar-store pink.
- **Don't** introduce dark mode or dark surfaces. Not goth, not moody, not high-contrast dark. Light mode only.
- **Don't** reach for `box-shadow` without exhausting border shifts and tonal backgrounds first.
- **Don't** use gradient text (`background-clip: text` with a gradient). Use Warm Garnet solid. Emphasis through weight or size.
- **Don't** use `border-left` greater than 1px as a colored accent stripe on cards, list items, or alerts. Use a full border or background tint instead.
- **Don't** reduce rose to one button. The warmth of the experience comes from rose woven through all interaction states.
- **Don't** use pure black (#000000) or pure white (#FFFFFF) as the page background. Deep Walnut for text, Cream Canvas for surfaces.
