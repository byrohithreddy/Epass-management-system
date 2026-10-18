# E-Gatepass design system

## Direction

Campus thresholds uses campus wayfinding as a visual language: warm limestone surfaces, evergreen actions, and small copper and brass markers. Request progress is shown as a labeled three-stop route, not a map. Student, administrator, and guard workflows retain their existing fields and behavior.

## Foundations

| Role | Token | Value |
| --- | --- | --- |
| Page ground | `--ground` | `#f3efe3` |
| Main surface | `--surface` | `#fffdf7` |
| Primary text | `--ink` | `#1b2b26` |
| Secondary text | `--ink-soft` | `#45574e` |
| Muted text | `--ink-muted` | `#64756c` |
| Evergreen action | `--evergreen` | `#173c35` |
| Evergreen hover | `--evergreen-hover` | `#24564b` |
| Wayfinding copper | `--copper` | `#a85c39` |
| Wayfinding brass | `--brass` | `#c49b49` |
| Borders | `--line` | `#ded9ca` |

Use dark green for primary actions and active role navigation. Reserve copper and brass for small labels, route markers, and focus treatment. Keep body copy on warm-white surfaces or use `--ink-soft` on the page ground; avoid small `--ink-muted` copy directly on limestone.

The body uses the system UI sans-serif stack. Large page and login headings use an available editorial serif, with system fallbacks. Data values use tabular numerals.

## Components and layout

- The inset app shell contains the E-Gatepass identity and three always-labeled role destinations.
- Page headings lead each workspace. Student requests pair a form with status history; request progress uses the same three-stop route.
- Administrator sign-in and request review use warm, high-contrast surfaces; tables scroll horizontally on small screens.
- Guard verification prioritizes the scan action and keeps verified-pass details and checkout controls grouped together.
- The barcode scanner is an accessible dialog with camera controls and manual student-ID entry.
- Elevation is reserved for the primary working surface. Borders, spacing, and restrained tinted shadows separate supporting content.

## Interaction and accessibility

- Preserve visible focus rings, keyboard-operable controls, the skip link, dialog labeling, and live status or error announcements.
- Keep destinations labeled on mobile; collapse multi-column work areas to one column at the narrow breakpoint.
- Respect reduced-motion preferences. Motion uses restrained opacity and transform transitions.
- Do not imply offline behavior or geographic tracking.

## Assets

No raster images or external visual assets are introduced; the identity and wayfinding details are rendered with existing icons and CSS.
