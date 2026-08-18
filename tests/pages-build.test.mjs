import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const expectedBase = '/hightouch-meridian-schema/'

async function productionAssets() {
  const assetNames = await readdir('dist/client/assets')
  const cssName = assetNames.find((name) => name.endsWith('.css'))
  const javascriptName = assetNames.find((name) => name.endsWith('.js'))
  assert.ok(cssName, 'production CSS asset')
  assert.ok(javascriptName, 'production JavaScript asset')
  return {
    css: await readFile(`dist/client/assets/${cssName}`, 'utf8'),
    javascript: await readFile(`dist/client/assets/${javascriptName}`, 'utf8'),
  }
}

test('production entry assets resolve under the GitHub repository subpath', async () => {
  const indexHtml = await readFile('dist/client/index.html', 'utf8')
  assert.match(indexHtml, new RegExp(`src="${expectedBase}assets/`))
  assert.match(indexHtml, new RegExp(`href="${expectedBase}assets/`))
  assert.doesNotMatch(indexHtml, /(?:src|href)="\/assets\//)
})

test('journey route is emitted as a directly addressable GitHub Pages entry', async () => {
  const journeyHtml = await readFile('dist/client/journey/index.html', 'utf8')
  assert.match(journeyHtml, new RegExp(`src="${expectedBase}assets/`))
  assert.match(journeyHtml, /<title>Women’s Tops — Viewed, Not Purchased<\/title>/)
})

test('production bundle has no runtime font or root-relative logo dependency', async () => {
  const { css, javascript } = await productionAssets()
  assert.doesNotMatch(css, /fonts\.googleapis\.com|fonts\.gstatic\.com/)
  assert.match(javascript, /hightouch-meridian-schema\/assets\/Hightouch-logo_black\.png/)
  assert.doesNotMatch(javascript, /src:"\/assets\/Hightouch-logo_black\.png"/)
})

test('Sites compatibility artifacts remain present beside the Pages client build', async () => {
  await readFile('dist/server/index.js', 'utf8')
  await readFile('dist/.openai/hosting.json', 'utf8')
})
