# Persona Platform - UI Design & Styling Decisions

**Purpose:** Capture the pre-decided frontend user experience for the multi-persona platform. This document contains layout plans, color palette, typography, component states, motion, and advanced styling so the implementation can follow a single source of truth with zero ambiguity.

## Decision Log (pre-decided)

- **Persona Experience Focus:** A unified dashboard for persona management, run history, and tools with a layout that puts contextual controls on the left rail and live outputs in the center. We will not deviate from this layout.
- **Styling Language:** Adopted layered glassmorphism with neon gradients to reinforce the futuristic agentic theme. The entire UI uses this palette "out of the box" so no other palettes are permitted.
- **Color Palette:** Primary accent is #7E5DFF (electric indigo), secondary accent #FFA726 (sunset orange), neutrals span #0B0F1E (charcoal), #13182B (deep space), #1E2441 (ink), with highlight gradients (7E5DFF → 4DA0FC) and micro-glow white (#F6F7FF).
- **Typography Stack:** Inter for body copy and Space Grotesk for headers. All font sizes and weights are predetermined by tokens (see section below).
- **Motion Language:** Micro-interactions use 220ms cubic-bezier(0.22, 1, 0.36, 1) transitions; focus states animate a neon glow ring.
- **Component Behavior:** Buttons always use solid gradients and drop shadows; cards use blurred backdrops. These behaviors are locked in to avoid inconsistent styling.
- **Responsiveness:** Layout collapses to a single column (<960px) with animated accordion sections for tool detail; these breakpoints are finalized.

## Layout & Screen Structure

### Login / Demo Gate

- **Structure:** Centered glass card (max width 460px) layered above blurred cityscape background gradient (#0B0F1E → #1E2441) with floating particle animation (CSS `::before` particles).
- **Elements:** Logo, login form, two call-to-action buttons (Demo User, Demo Admin), subtle status text. Buttons stretch full width with gradient backgrounds.
- **States Matrix:**
  | State      | Description | Styling |
  | ---------- | ----------- | ------- |
  | Idle       | Form displayed | Card elevation 0.2, no glow |
  | Validation | Missing fields | Input border glows #FF6B81, shake animation |
  | Loading    | Waiting for API | Loader (ring) inside button, opacity 0.8 |

### Dashboard (Persona Focus)

- **Layout:** Three-column grid (left rail, center workspace, right utility). Left rail houses persona switcher + tools, center hosts run timeline + storytelling cards, right column shows memory/select connectors.
- **Advanced Styling:** Center workspace uses layered gradients (#13182B background, overlay of linear gradient (160deg) from rgba(126,93,255,0.22) to transparent). Components float with border blur and soft drop shadow.
- **Key Panels:**
  - Persona card stack: glassmorphism with `backdrop-filter: blur(18px)` and border `1px solid rgba(255,255,255,0.08)`.
  - Run timeline: gradient stroke preceding vertical line using `::before`.
  - Tool tiles: icon circle with radial gradient highlight.
  - **Storytelling Cards:** Data-driven cards displaying real-time persona activity "aura" (heat maps of tool usage, LLM call frequency, success rates) positioned above run timeline. Cards use subtle pulsing gradients matching persona theme color.

**Responsive Layout Scaffolding:**
- **Desktop (>=1280px):** Three-column grid: `grid-template-columns: 280px 1fr 320px`
- **Tablet (960px-1279px):** Two-column grid: `grid-template-columns: 240px 1fr` (right column becomes bottom drawer/accordion)
- **Mobile (<960px):** Single column: `grid-template-columns: 1fr` (all panels stack, left rail becomes bottom navigation, right column becomes modal/drawer)
- **Component Grid Rules:** All cards use `display: grid` with `gap: 16px` (desktop) or `gap: 12px` (mobile). Cards auto-fit with `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` for flexible layouts.

## Design Tokens

| Token | Value | Notes |
| ----- | ----- | ----- |
| Primary Accent | #7E5DFF | Buttons, focus glow |
| Secondary Accent | #FFA726 | Status badges, alerts |
| Background | #0B0F1E | Body background |
| Sub-Background | #13182B | Cards |
| Outline | rgba(255,255,255,0.08) | Card borders |
| Text Primary | #F6F7FF | Main text |
| Text Secondary | #A1A9C1 | Muted text |
| Shadow | 0 20px 40px rgba(3,5,33,0.55) | Elevation |
| Gradient | linear-gradient(135deg,#7E5DFF,#4DA0FC) | Buttons |

### Dynamic Persona Theme Colors

Each persona can have a subtle theme color shift applied to its cards and accent elements while maintaining the base palette. Theme colors are calculated by shifting the primary accent hue:

- **Theme Shift Formula:** `hsl(hue + shift, saturation, lightness)` where shift ranges from -30° to +30°
- **Applied To:** Persona card border glow, storytelling card gradients, active state highlights
- **Base Remains:** Primary accent (#7E5DFF) always used for global UI elements (buttons, focus rings)
- **Examples:**
  - Default persona: No shift (uses base #7E5DFF)
  - "Analyst" persona: +15° hue shift (warmer purple-blue)
  - "Creative" persona: -20° hue shift (cooler purple-pink)
- **Implementation:** CSS custom properties per persona: `--persona-theme-hue: 270` (for -15° shift from base 282°)

## Typography & Iconography

- **Fonts:** `font-family: 'Inter', system-ui;` for body, `font-family: 'Space Grotesk', 'Inter', sans-serif` for headings.
- **Heading Scale:** h1 48px/1.2, h2 34px/1.25, h3 26px/1.3.
- **Body Text:** 16px with 1.5 line height.
- **Buttons:** Uppercase, letter spacing 0.08em, weight 600.
- **Icons:** Use a single stroke set (Heroicons Outline) tinted with accent colors. Toggle active states by filling with gradient.

## Motion & Interaction

- **Transitions:** All interactive states transition with `transition: transform 220ms cubic-bezier(0.22,1,0.36,1), box-shadow 220ms ease`.
- **Micro-interactions:** Buttons scale to 0.975 on press; cards lift and extend glow on hover.
- **Loading:** Use animated gradient skeletons (CSS `background: linear-gradient(90deg, rgba(126,93,255,0.05), rgba(126,93,255,0.25), rgba(126,93,255,0.05))` with `background-size: 200%`).
- **Focus Ring:** Outline via pseudo-element with `box-shadow: 0 0 0 3px rgba(126,93,255,0.35)` and 160ms fade.

## Component States

### Persona Tile

| State | Behavior | Visual |
| ----- | -------- | ------ |
| Default | Displays name, status, quick actions | Glass card, subtle drop shadow, persona theme color border (1px, 30% opacity) |
| Hover | Shows tool badges | Elevated shadow (0 30px 60px rgba(0,0,0,0.5)), neon glow outline (persona theme color) |
| Active | Selected persona | Gradient border (persona theme gradient), gradient fill in badge, theme color glow |
| Running | Agent executing | Pulsing theme color border (2px), shimmer overlay, "active" badge with theme accent |

### Storytelling Cards (Dashboard)

| State | Behavior | Visual |
| ----- | -------- | ------ |
| Idle | Displaying metrics | Glass card, subtle gradient background (persona theme color, 10% opacity) |
| Loading | Fetching data | Animated gradient skeleton (shimmer effect) |
| Updated | New data received | Brief pulse animation (scale 1.02 for 200ms), theme color highlight |
| Error | Data fetch failed | Sunset orange border glow, error icon |

**Card Types:**
- **Activity Aura:** Heat map visualization of tool usage over last 24 hours (circular gradient from persona theme color)
- **LLM Call Frequency:** Line chart showing LLM API calls per hour with theme color stroke
- **Success Rate:** Radial progress indicator with theme color fill (green for >90%, orange for 70-90%, red for <70%)
- **Recent Runs:** Mini timeline showing last 5 runs with status dots (theme color for completed, gray for pending/failed)

### Run Timeline Item

| State | Behavior | Visual |
| ----- | -------- | ------ |
| Pending | Waiting on orchestration | Gray icon, pulsing dot |
| Running | Tool executing | Accent spinner, glowing line |
| Completed | Step done | Secondary accent badge, check icon |
| Failed | Error occurred | Sunset orange text, shake animation |

## Accessibility & Responsiveness

- **Contrast:** All text on dark surfaces uses contrast ≥ 4.5:1. Accent buttons include white text on gradient backgrounds.
- **Breakpoints:** 
  - Desktop: `>=1280px` (three-column: 280px / 1fr / 320px)
  - Tablet: `960px-1279px` (two-column: 240px / 1fr, right column becomes drawer)
  - Mobile: `<960px` (single column, stacked layout with bottom navigation)
- **Component Grid Rules:**
  - Cards use `display: grid` with `gap: 16px` (desktop) or `gap: 12px` (mobile/tablet)
  - Auto-fit grid: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` for flexible card layouts
  - Storytelling cards: `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))` (4 columns max on desktop)
  - Persona tiles: `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` (responsive grid)
- **Keyboard:** All cards and buttons have `:focus-visible` outline from accent glow. Tooltips available for icons.
- **Reduced Motion:** Prefers-reduced-motion disables pulsing and shimmer, replacing with static states. Theme color shifts still apply but no animations.

## Implementation Notes

- All UI decisions above are final. No alternate palettes, fonts, or layouts may be used without updating this document.
- The advanced styling (glass surfaces, gradient glows, motion curves) is handled via shared utility classes (`.glass-panel`, `.neon-button`, `.shimmer-surface`) defined once and applied consistently.

