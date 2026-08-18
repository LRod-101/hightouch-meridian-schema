# Design QA — Meridian Customer Studio Schema

## Evidence

- Reference: `public/qa/reference.png` (1308 × 702 source pixels)
- Final implementation capture: `public/qa/implementation-final.jpg` (1280 × 720 CSS-pixel viewport)
- Same-viewport comparison page: `public/qa/compare-final.html`
- Combined comparison capture: `qa/comparison-final.jpg`
- Responsive captures: `qa/schema-after-1440x900.jpg`, `qa/schema-after-1366x768.jpg`, and `qa/schema-after-1280x720.jpg`
- State: default schema view, empty search, no selected model, presentation mode off

The reference and implementation were reviewed together in one comparison input. Both are normalized into a 1280 × 720 frame so the application shell, canvas density, card scale, rail width, minimap, toolbar, and controls can be judged at the same displayed viewport.

## Structural and interaction checks

- The canvas renders exactly 10 schema cards, 11 routes, and 11 cardinality pills.
- The right model library renders all 10 models in the default state.
- Search for `women's tops` filters the model library to Product Categories; clearing it restores the library.
- Selecting Customers highlights its five direct relationships and dims unrelated schema cards.
- Create opens the creation menu and Escape closes it.
- Zoom in changes the fitted percentage, and reset restores the calculated fit.
- Present changes to the focused presentation layout, and Escape restores the default shell.
- Browser logs contained no errors or warnings during the tested flow.

## Responsive and fit checks

- 1440 × 900: document 1440 × 900, fit 95%, no body overflow.
- 1366 × 768: document 1366 × 768, fit 90%, no body overflow.
- 1280 × 720: document 1280 × 720, fit 82%, no body overflow.
- At every tested size the sidebar and 220 px model library remain visible, while the complete 1020 × 620 graph stage fits inside the remaining canvas.

## Visual findings

- P0: none.
- P1: none.
- P2: none.
- P3: the reference screenshot contains more models and therefore has a denser/taller graph. The implementation preserves the requested ten-model ERD and uses the available width to keep every route and label unambiguous.
- P3: the reference includes a subtle dotted canvas texture. The existing prototype's clean white canvas was retained because the requested major visual change was limited to layout and routing.

## Final comparison judgment

- The Hightouch-inspired sidebar, toolbar, right model library, cards, icon treatments, typography, colors, spacing, minimap, and controls remain visually consistent with the supplied reference.
- The new connector treatment uses thin light-blue lines, softly rounded orthogonal corners, separated source/target ports, and white cardinality pills.
- No route crosses another route, card, or cardinality label in the deterministic geometry tests or rendered default view.
- Relationship direction is readable from the label sequence and matches the requested `1:many`, `many:1`, and simplified `1:1` semantics.

final result: passed
