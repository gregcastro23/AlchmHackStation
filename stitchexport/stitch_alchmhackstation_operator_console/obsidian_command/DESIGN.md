---
name: Obsidian Command
colors:
  surface: '#12140e'
  surface-dim: '#12140e'
  surface-bright: '#383a32'
  surface-container-lowest: '#0d0f09'
  surface-container-low: '#1b1c16'
  surface-container: '#1f201a'
  surface-container-high: '#292b24'
  surface-container-highest: '#34362e'
  on-surface: '#e3e3d8'
  on-surface-variant: '#c5c8b6'
  inverse-surface: '#e3e3d8'
  inverse-on-surface: '#2f312a'
  outline: '#8f9282'
  outline-variant: '#44483a'
  surface-tint: '#b2d272'
  primary: '#ffffff'
  on-primary: '#253600'
  primary-container: '#ceee8b'
  on-primary-container: '#536d19'
  inverse-primary: '#4d6713'
  secondary: '#9ddf2e'
  on-secondary: '#213600'
  secondary-container: '#83c300'
  on-secondary-container: '#304b00'
  tertiary: '#ffffff'
  on-tertiary: '#362d3a'
  tertiary-container: '#eddeee'
  on-tertiary-container: '#6c616f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ceee8b'
  primary-fixed-dim: '#b2d272'
  on-primary-fixed: '#141f00'
  on-primary-fixed-variant: '#374e00'
  secondary-fixed: '#b2f746'
  secondary-fixed-dim: '#98da27'
  on-secondary-fixed: '#121f00'
  on-secondary-fixed-variant: '#334f00'
  tertiary-fixed: '#eddeee'
  tertiary-fixed-dim: '#d1c2d2'
  on-tertiary-fixed: '#211924'
  on-tertiary-fixed-variant: '#4e4350'
  background: '#12140e'
  on-background: '#e3e3d8'
  surface-variant: '#34362e'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.02em
  body-reg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.01em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  telemetry-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  panel-padding: 20px
  stack-gap: 8px
---

## Brand & Style

The design system is engineered for the high-velocity Ethereum developer. It evokes the feeling of a mission-critical terminal—focused, immutable, and precise. The brand personality is "Technical Premium," blending the raw efficiency of a command-line interface with the sophisticated layering of a modern IDE.

The aesthetic follows a **Modern-Industrial Minimalism** approach. It utilizes a strictly dark-mode environment to reduce eye strain during long coding sessions. The UI is defined by structural integrity, using hair-line borders and volumetric layering rather than shadows to establish hierarchy. Visual interest is derived from "Acid Green" telemetry and high-contrast status signals that cut through the obsidian backdrop.

## Colors

The palette is anchored in deep blacks and cool grays to create a "void" effect where code and data become the primary focal points. 

- **The Core:** Page and Shell backgrounds provide the foundation. 
- **The Accents:** `Acid Green` is the primary action color, used for success states and active indicators. Its glow should be used sparingly to represent "power on" states.
- **Telemetry:** `Cyan` is reserved for data readouts and non-critical system info. `Amber` and `Error` provide immediate visual priority for compiler warnings and failed transactions.
- **Borders:** A consistent `10% opacity Titanium` is used for all structural divisions, ensuring a crisp, blueprint-like appearance.

## Typography

The system uses **Hanken Grotesk** (as a high-fidelity alternative to Urbanist) for the primary UI, providing a sharp, contemporary sans-serif feel with wide tracking for legibility. 

**JetBrains Mono** handles all technical data, logs, and telemetry. It is optimized for density, allowing developers to scan large blocks of hex code or logs without fatigue. 

- **Headlines:** Keep short and impactful.
- **Data Densities:** Use `code-sm` for most terminal outputs.
- **Status Labels:** Use `label-caps` for section headers and button labels to reinforce the technical, "instrument panel" aesthetic.

## Layout & Spacing

This design system utilizes a **Fixed Grid with Fluid Containers**. The layout is built on a 4px base unit to ensure perfect alignment of hairline borders. 

- **Grid Model:** A 12-column system on desktop, collapsing to 4 on mobile. 
- **The Shell:** The main application container (Shell BG) remains fixed, with internal panels (Panel BG) reflowing based on terminal requirements.
- **Technical Grid:** An optional 24px background grid pattern can be applied to the `Page BG` level at 5% opacity to reinforce the engineering theme.
- **Density:** High information density is preferred. Gaps between related technical elements should be minimal (`stack-gap`), while distinct functional zones are separated by `gutter`.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Hairline Outlines**, never through traditional drop shadows. 

1. **Level 0 (Base):** `#050506` (The void).
2. **Level 1 (App Shell):** `#0A0A0B` with a 1px `Titanium` border.
3. **Level 2 (Panels):** `#101114` used for sidebars and secondary modules.
4. **Level 3 (Raised/Active):** `#15171B` for focused editor windows or active terminal tabs.

**The Glow Effect:** When an element is `active` or `selected`, apply a subtle outer glow using `Acid Green` with a 10px blur at 20% opacity. This signifies "Power" or "Focus" without breaking the flat, technical aesthetic.

## Shapes

The design system uses **Sharp (0px)** corners. This reinforces the precision and industrial nature of the Ethereum developer experience. 

- **Hard Edges:** All buttons, input fields, and panels must have 90-degree angles.
- **Consistency:** If a component requires a container (like a chip), it remains rectangular. 
- **Separation:** Use the 1px `Titanium` border to define shape boundaries rather than color shifts where possible.

## Components

- **Buttons:** Primary buttons use a 1px `Acid Green` border and `Acid Green` text. On hover, they fill with `Acid Green` and use `#050506` for text. No rounded corners.
- **Input Fields:** `#0A0A0B` background with a `Titanium` border. On focus, the border changes to `Cyan Telemetry` and a subtle 1px inner glow is applied.
- **Chips/Status:** Rectangular blocks with `JetBrains Mono` text. Success states use `Acid Green` text; system notifications use `Cyan`.
- **Terminal/Shell:** Use the `Shell BG`. Scrollbars should be minimalist 2px lines in `Titanium` (20% opacity).
- **Cards/Panels:** Defined by 1px borders. Headers within cards should have a subtle bottom border to separate title telemetry from content.
- **Tabs:** Underline-style indicators using `Acid Green` for the active state. Inactive tabs use `Secondary Text`.
- **Active Signals:** Small 4x4px squares of `Acid Green` placed next to active node connections or running processes.