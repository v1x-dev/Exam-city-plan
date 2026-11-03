---
name: Academic Seating Engine
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#44474e'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#4a5f81'
  primary: '#001632'
  on-primary: '#ffffff'
  primary-container: '#142b4a'
  on-primary-container: '#7d93b7'
  inverse-primary: '#b2c7ee'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#081826'
  on-tertiary: '#ffffff'
  tertiary-container: '#1e2c3b'
  on-tertiary-container: '#8593a6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#b2c7ee'
  on-primary-fixed: '#021c3a'
  on-primary-fixed-variant: '#324768'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#d5e4f8'
  tertiary-fixed-dim: '#b9c8db'
  on-tertiary-fixed: '#0e1d2b'
  on-tertiary-fixed-variant: '#3a4858'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.025em
  code-tabular:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1.125rem
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system targets university registrars, department heads, and examination officers who orchestrate high-stakes examination seating across campuses. The emotional tone must communicate institutional authority, mathematical precision, and calm clarity under administrative pressure.

The aesthetic blends **Modern Institutional** and **High-Density Utility**. It eschews decorative fluff for purposeful structure: disciplined tabular grids, clean architectural room arrangements, subtle border definitions, and distinct state indicators. Deep institutional navy anchors administrative authority, while energetic royal blue directs operational focus to actions like algorithm generation, desk assignments, and student lookups.

## Colors

The palette establishes an unambiguous hierarchy built for extended operational sessions:

- **Institutional Primary (`#142B4A`)**: The deep navy signature applied to persistent side navigation, brand surfaces, column headers in primary summary tables, and authoritative framing elements.
- **Action Secondary (`#2563EB`)**: Royal blue used for focal-point actions—primary CTA buttons, active tab indicators, selected seat rings, and interactive row highlights.
- **Surface Accent / Tertiary (`#DBEAFE`)**: Ice blue tint for row selection states, non-destructive highlights, active desk selections in the room editor, and badge backgrounds.
- **Neutral Primary (`#1E293B`)**: Deep slate for standard alphanumeric text, high-contrast headings, and dense tabular values.
- **Neutral Muted (`#64748B`)**: Secondary text token for table headers, metadata, student registration IDs, and inactive iconography.
- **Surface Canvas & Card (`#FFFFFF` on `#F8FAFC`)**: Crisp pure white for cards, modals, and desk cells resting against a cool neutral-slate tinted canvas background.
- **Structural Border (`#E2E8F0`)**: 1px structural boundary dividing rooms, tables, and functional blocks without visual clutter.
- **System States**:
  - Success (`#16A34A`): Full seating completion, verified invigilator assignment, hall capacity within limits.
  - Error (`#DC2626`): Seating conflict, double-booked student or room, over-capacity status.
  - Warning (`#EA580C`): Special accommodations unassigned, partial roll calls, unplaced candidates.

## Typography

The type system balances administrative presence with dense alphanumeric legibility:

- **Headlines (Plus Jakarta Sans)**: Provides structured, institutional dignity for hall designations, cohort titles, and modal headers. 
- **Body & Data Tables (Inter)**: Delivers geometric neutrality. For ERP tables, student matriculation numbers, hall IDs, and timestamps, enable `font-feature-settings: "tnum" 1` (tabular figures) so numerical data aligns vertically across thousands of records.
- **Labels & Micro-data**: Uses slightly spaced semi-bold variants (`label-sm`) for column sorting flags, status tags, seat coordinate indicators (e.g., `Row C • Seat 14`), and capacity counters.

## Layout & Spacing

The layout is built on a **Fluid Master-Detail Layout Model** structured for high-resolution desk displays (1440px+) while retaining resilient responsiveness down to laptops:

- **Fixed Sidebar**: Fixed at 260px width, colored with Primary Navy (`#142B4A`), collapsing to an 72px icon rail on screens under 1280px.
- **Dynamic Content Canvas**: Employs a 12-column grid system with 16px (`1rem`) gutters on tablet and 24px (`1.5rem`) on desktop.
- **High-Density Spacing Logic**: Component padding relies strictly on compact increments (`space-xs` to `space-md`) within tables and grid seating canvases to ensure maximum visible data above the fold. Generous spacing (`space-xl` to `space-2xl`) is reserved solely for canvas margins and major dashboard card delineations.

## Elevation & Depth

This system avoids expressive blur-heavy shadows, relying on structural **low-contrast outlines** paired with **micro-ambient elevation** to maintain data clarity:

- **Level 0 (Flat)**: Workspace background (`#F8FAFC`). No elevation or border.
- **Level 1 (Structural Canvas & Cards)**: Pure white (`#FFFFFF`) containers framed by a crisp 1px border in `#E2E8F0`. Shadow is microscopic: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Level 2 (Interactive Floating Elements & Dropdowns)**: Active popovers, invigilator assignment menus, and quick-filter trays. Framed by a 1px border in `#CBD5E1` and an ambient shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Modal Dialogs & Layout Generators)**: Room configuration modals and seating algorithm progress dialogs. Supported by a 50% opacity slate overlay (`rgba(15, 23, 42, 0.50)` with a 2px backdrop blur), framed by a 1px border in `#CBD5E1` with elevation: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.

## Shapes

The roundedness level is **Soft (`1`)**. 

In high-density ERP applications, aggressive border radii waste visual real estate and look unsuited for structured data.
- Base interactive elements (inputs, table action buttons, desk grid units) feature `0.25rem` (4px) radii.
- Content containers, room matrix cards, and summary statistic modules use `rounded-lg` (`0.5rem` / 8px).
- Status pills, seat reservation tags, and numerical counts use fully rounded pill geometry (`9999px`) to create an immediate shape distinction between functional layout containers and metadata labels.

## Components

### Buttons
- **Primary**: Solid Royal Blue (`#2563EB`) with white text. Focus state has a 2px offset ring in `#93C5FD`. Active state shifts to `#1D4ED8`. Height is 36px in standard density, 32px in compact tables.
- **Secondary / Institutional**: Navy Blue (`#142B4A`) with white text, used for primary export and formal confirmation actions.
- **Outline / Ghost**: 1px `#E2E8F0` border, transparent background, `#1E293B` text. Hover shifts to `#F1F5F9`.
- **Destructive**: Crisp `#DC2626` background or outline with error text for purging seating arrangements or removing candidates.

### High-Density Data Tables
- Header row styled in `#F8FAFC` with 1px border-bottom (`#CBD5E1`). Column labels set in `label-sm` in `#64748B`, with uppercase styling and tabular column sorters.
- Row heights are constrained to 40px (compact) or 48px (standard).
- Alternate row striping is omitted; instead, use a 1px `#E2E8F0` horizontal divider with a hover state in `#F8FAFC` and selected state in `#DBEAFE` with a 2px `#2563EB` left accent bar.

### Interactive Room Grid Layout (The Seating Matrix)
- **Desk Unit**: Aspect ratio 1:1 or 4:3, minimum dimensions 44px × 44px. White card background, 1px `#CBD5E1` border, 4px rounded radius.
- **Desk States**:
  - *Vacant*: White background with subtle dashed outline (`#CBD5E1`), displaying desk code (e.g., `A-01`) in `#94A3B8`.
  - *Assigned*: Light neutral surface (`#F1F5F9`), solid border (`#CBD5E1`), displaying candidate photo thumbnail or roll number abbreviation in `#1E293B`.
  - *Selected*: Active ring of 2px solid `#2563EB`, background `#DBEAFE`.
  - *Conflict / Double-Booked*: `#FEE2E2` fill, 1.5px `#DC2626` border, displaying warning badge.
  - *Special Accommodations*: `#FEF3C7` fill with `#EA580C` boundary marker for accessibility or extra-time candidates.
- **Podium / Front Indicator**: A solid `#142B4A` wide architectural strip anchored to the top/front of the room canvas with the label "LECTURE STAGE / SCREEN".

### Status Badges & Chips
- Fully rounded pills (`rounded-full`) with a height of 22px and horizontal padding of 8px (`space-sm`).
- **Generated / Approved**: Background `#DCFCE7`, text `#166534`.
- **In Progress / Draft**: Background `#DBEAFE`, text `#1E40AF`.
- **Conflict / Over-Capacity**: Background `#FEE2E2`, text `#991B1B`.
- **Pending Review**: Background `#FFEDD5`, text `#9A3412`.

### Statistics & Capacity Metric Widgets
- Crisp white cards with 1px `#E2E8F0` border and `0.5rem` radius.
- Includes a 3-part layout: muted uppercase category label (`label-sm`), large quantitative readout in `headline-lg` (`Plus Jakarta Sans`), and a micro progress bar or capacity indicator ratio (e.g., `482 / 500 Seats • 96% Full`).

### Form Fields & Filters
- Clean inputs with a 1px `#CBD5E1` border, 36px total height, and 12px horizontal inset.
- Focus ring matches secondary blue: 1px border `#2563EB` plus 3px outer glow `rgba(37, 99, 235, 0.15)`.
- Pre-appended filter icons and inline seat-count badges inside dropdown triggers.

### Modal Dialogs
- Fixed widths (520px for config, 840px for room templates).
- Explicit 1px `#E2E8F0` header and footer dividers. The footer houses right-aligned actions with the primary button placed farthest right.