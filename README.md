# Meridian Customer Studio Schema

An interactive, Hightouch Customer Studio-inspired schema for the Meridian Retail Group interview scenario. The page renders ten data models and eleven live SVG relationships, with search, model highlighting, zoom, fit-to-screen presentation mode, a model library, and a minimap.

## Local development

Requirements:

- Node.js 22
- npm 10 or newer

Install and start the local application:

```bash
npm ci
npm run dev
```

Vite uses `/` during development, so the page is available from the local server root.

## Tests

Run the default schema, geometry, fit, and production Pages checks:

```bash
npm test
```

Run compatibility checks for the retained Sites packaging:

```bash
npm run test:sites
```

The legacy Miro export is not the presentation surface, but it can still be generated and checked explicitly:

```bash
npm run test:miro
```

## Production build

The requested repository is `LRod-101/hightouch-meridian-schema`, so the production base is:

```text
/hightouch-meridian-schema/
```

Build the static client and retained Sites compatibility files:

```bash
VITE_BASE_PATH=/hightouch-meridian-schema/ npm run build
```

The GitHub Pages artifact is written to `dist/client`. The same build also retains `dist/server/index.js` and `dist/.openai/hosting.json` for optional Sites compatibility; GitHub Pages remains the presentation destination.

To preview the production build locally:

```bash
npm run preview -- --host 127.0.0.1
```

Open the repository-relative path reported by Vite and verify that JavaScript, CSS, the Hightouch logo, search, highlighting, zoom, and presentation mode all load without console errors.

## GitHub Pages configuration

The workflow at `.github/workflows/deploy-pages.yml` uses GitHub's official Pages actions and is intentionally manual (`workflow_dispatch`). It does not deploy merely because code is pushed.

After external deployment is explicitly authorized:

1. Create or verify the `LRod-101/hightouch-meridian-schema` repository.
2. Push the verified local branch.
3. In the repository, open **Settings → Pages** and select **GitHub Actions** as the source.
4. Run **Deploy Meridian schema to GitHub Pages** from the Actions tab.
5. Verify the deployed page at <https://lrod-101.github.io/hightouch-meridian-schema/>.

Post-deployment verification must confirm:

- All ten graph models and ten library entries are present.
- All eleven relationships are visible and semantically correct.
- No connector, node, or cardinality-label collisions appear at 1440×900 and the presentation laptop viewport.
- Search, selection/highlighting, Create menu, zoom, fit/reset, and presentation mode work.
- The browser console has no errors and all assets return successful responses from the repository subpath.

No token, credential, repository creation, Pages enablement, push, or external deployment is part of the local build.
