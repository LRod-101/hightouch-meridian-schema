import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('Miro export is self-contained and includes the Meridian schema', async () => {
  const html = await readFile('dist/miro-schema.html', 'utf8')

  assert.doesNotMatch(html, /<style\b/)
  assert.doesNotMatch(html, /<link\b/)
  assert.doesNotMatch(html, /@import/)
  assert.doesNotMatch(html, /<script\b/)
  assert.doesNotMatch(html, /material-symbols-rounded/)
  assert.match(html, /<img src="data:image\/svg\+xml;base64,/)
  assert.match(html, /width="100%" height="100%"/)
  assert.doesNotMatch(html, /src="\/assets\//)
  assert.doesNotMatch(html, /href="\/assets\//)
  assert.doesNotMatch(html, /url\(['"]?\/assets\//)
  assert.match(html, /Meridian Customer Studio/)
})
