# Meridian Schema Graph and GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a collision-free, Hightouch-faithful Meridian schema page that works at presentation viewports and under the `/hightouch-meridian-schema/` GitHub Pages subpath.

**Architecture:** Keep `schemaData.js` as the semantic source of truth and move all visual geometry into a deterministic layout module. Render softly rounded orthogonal SVG paths from explicit route points, calculate fit scale from the available canvas, and validate the geometry with pure Node tests. Preserve the existing Sites packaging while adding an independent GitHub Pages deployment workflow.

**Tech Stack:** React 19, Vite 6, SVG, Node test runner, GitHub Pages Actions.

**Spec:** `../../../../HIGHTOUCH_SCHEMA_FIX_SPEC.md` plus the user-approved GitHub account, repository, visual-fidelity, and relationship-direction clarifications from 2026-08-17.

## Global Constraints

- Keep exactly 10 models and 11 relationships.
- Keep `Customers → Loyalty Membership` visually labeled `1:1`; explain it as conceptually one-to-zero-or-one.
- Render fact/event-to-dimension relationships as `many:1`: Order Items → Products, Store Purchases → Stores, Store Purchases → Products, Digital Events → Products, and Products → Product Categories.
- Preserve the Hightouch-inspired shell, sidebar, toolbar, right library, cards, icons, typography, colors, minimap, and controls.
- Use live DOM/SVG, zero crossings, 16px unrelated-node clearance, 24px parallel-lane separation, and 12px label separation.
- Configure the production base as `/hightouch-meridian-schema/`.
- Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact.
- Do not push, publish, enable Pages, or otherwise deploy externally.

---

### Task 1: Deterministic graph geometry

**Files:**
- Create: `src/schemaLayout.js`
- Create: `tests/schema-layout.test.mjs`
- Modify: `src/schemaData.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `models`, `relationships`, and model IDs from `schemaData.js`.
- Produces: `NODE_LAYOUT`, `EDGE_ROUTES`, `GRAPH_WIDTH`, `GRAPH_HEIGHT`, `roundedOrthogonalPath(points, radius)`, and geometry validation helpers.

- [ ] **Step 1: Write failing tests for complete route coverage and display cardinalities**

```js
assert.deepEqual(Object.keys(EDGE_ROUTES).sort(), relationships.map(({ id }) => id).sort())
assert.equal(relationshipById['order-items-products'].label, 'many:1')
assert.equal(relationshipById['digital-events-products'].label, 'many:1')
```

- [ ] **Step 2: Run the test and confirm it fails because the layout module and normalized relationships do not exist**

Run: `node --test tests/schema-layout.test.mjs`

- [ ] **Step 3: Implement the semantic directions and explicit node/edge geometry**

Use four visual layers and explicit edge points. Keep customer branches in separate tracks and route the Products-to-Order-Items relationship around the right side of the context column.

- [ ] **Step 4: Add failing collision tests**

```js
assert.deepEqual(findNodeCollisions(), [])
assert.deepEqual(findEdgeCrossings(), [])
assert.deepEqual(findEdgeNodeCollisions(16), [])
assert.deepEqual(findLabelCollisions(12), [])
```

- [ ] **Step 5: Adjust only geometry until all layout tests pass**

Run: `node --test tests/schema-layout.test.mjs tests/schema-data.test.mjs`

### Task 2: Render the collision-free graph and fit behavior

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Create: `tests/presentation-fit.test.mjs`

**Interfaces:**
- Consumes: geometry exported by `schemaLayout.js`.
- Produces: `calculateFitScale(containerWidth, containerHeight, graphWidth, graphHeight, padding)`, presentation mode, named graph/library test IDs, and rounded SVG paths.

- [ ] **Step 1: Write failing fit-scale tests for 1440×900, 1366×768, and 1280×720 canvas sizes**

```js
assert.ok(calculateFitScale(1022, 842, GRAPH_WIDTH, GRAPH_HEIGHT, 28) <= 1)
assert.ok(calculateFitScale(862, 662, GRAPH_WIDTH, GRAPH_HEIGHT, 24) > 0)
```

- [ ] **Step 2: Run the test and confirm the fit helper is missing**

Run: `node --test tests/presentation-fit.test.mjs`

- [ ] **Step 3: Add the pure fit helper and verify the test passes**

- [ ] **Step 4: Replace generic Bézier generation with layout routes**

Render every edge from `EDGE_ROUTES`, use the explicit label anchor, preserve highlighting, and give canvas/library cards distinct test IDs.

- [ ] **Step 5: Add presentation mode and ResizeObserver-driven fit**

Reset returns to fit scale. Presentation mode compacts secondary chrome without removing the sidebar, toolbar, library, minimap, or controls.

- [ ] **Step 6: Run the layout, fit, and schema tests**

Run: `node --test tests/schema-layout.test.mjs tests/presentation-fit.test.mjs tests/schema-data.test.mjs`

### Task 3: Repository-relative assets and GitHub Pages

**Files:**
- Modify: `vite.config.mjs`
- Modify: `src/App.jsx`
- Modify: `src/styles.css`
- Modify: `package.json`
- Create: `tests/pages-build.test.mjs`
- Create: `.github/workflows/deploy-pages.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: `VITE_BASE_PATH`, defaulting to `/hightouch-meridian-schema/` for production and `/` for development.
- Produces: `dist/client` whose scripts, styles, and public assets resolve under `/hightouch-meridian-schema/`.

- [ ] **Step 1: Write a failing production-build artifact test**

```js
assert.match(indexHtml, /\/hightouch-meridian-schema\/assets\//)
assert.doesNotMatch(css, /fonts\.googleapis\.com/)
assert.doesNotMatch(bundledJs, /src:\"\/assets\/Hightouch-logo_black\.png\"/)
```

- [ ] **Step 2: Run the current production build and confirm the test fails on root-relative assets and the remote font**

Run: `npm run build && node --test tests/pages-build.test.mjs`

- [ ] **Step 3: Configure Vite base and repository-relative public assets**

Use `command === 'serve' ? '/' : process.env.VITE_BASE_PATH || '/hightouch-meridian-schema/'` and `import.meta.env.BASE_URL` for the public logo.

- [ ] **Step 4: Remove the runtime Google Fonts dependency**

Use the bundled/system UI font stack so the interview page has no font-network dependency.

- [ ] **Step 5: Add the official Pages workflow and README**

Use `actions/configure-pages`, `actions/upload-pages-artifact` with `dist/client`, and `actions/deploy-pages`. Document that deployment remains unauthorized until explicitly requested.

- [ ] **Step 6: Build and verify the Pages artifact test passes**

Run: `VITE_BASE_PATH=/hightouch-meridian-schema/ npm run build && node --test tests/pages-build.test.mjs`

### Task 4: Test-suite repair and local interaction verification

**Files:**
- Modify: `package.json`
- Modify: `tests/miro-export.test.mjs`
- Preserve: `tests/sites-worker.test.mjs`

**Interfaces:**
- Produces: a default `npm test` that does not require an unbuilt legacy Miro artifact and a separate opt-in legacy export test.

- [ ] **Step 1: Update the default test command to cover schema, layout, fit, and Pages build integrity**

- [ ] **Step 2: Keep the Miro export test behind `npm run test:miro` and generate its artifact first**

- [ ] **Step 3: Run all default and compatibility tests**

Run: `npm test && npm run test:sites && npm run test:miro`

- [ ] **Step 4: Verify search, selection, Create menu, zoom, reset, and presentation mode in the local browser**

Confirm no console errors and all 10 canvas models, 10 library models, and 11 edges are present.

### Task 5: Same-viewport Product Design QA and local repository setup

**Files:**
- Modify: `design-qa.md`
- Create: `qa/schema-after-1440x900.png`
- Create: `qa/schema-reference-1440x900.png`
- Create: `qa/schema-comparison-1440x900.png`
- Create locally: `.git/`

**Interfaces:**
- Produces: accepted same-viewport comparison evidence and a local `main` branch with no remote push.

- [ ] **Step 1: Capture the final page at 1440×900, 1366×768, and 1280×720**

- [ ] **Step 2: Compare the 1440×900 implementation and supplied reference in one visual input**

Check shell fidelity, hierarchy, spacing, cards, typography, connector softness, labels, minimap, controls, and right-library balance.

- [ ] **Step 3: Correct visible regressions and repeat the same-viewport comparison**

- [ ] **Step 4: Update `design-qa.md` with before/after evidence and known limits**

- [ ] **Step 5: Run final verification**

Run: `npm test && npm run test:sites && npm run test:miro && VITE_BASE_PATH=/hightouch-meridian-schema/ npm run build`

- [ ] **Step 6: Initialize the local repository on `main` and verify no remote exists**

```bash
git init -b main
git remote -v
```

Do not push, publish, create a GitHub repository, or enable Pages.
