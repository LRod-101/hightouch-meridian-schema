import assert from 'node:assert/strict'
import test from 'node:test'

import { presentationBodyClass, presentationTitle, resolvePresentationRoute } from '../src/presentationRoute.js'
import { JOURNEY_FRAME } from '../src/journeyLayout.js'

test('repository-relative journey URLs select the journey presentation', () => {
  assert.equal(resolvePresentationRoute('/hightouch-meridian-schema/journey/'), 'journey')
  assert.equal(resolvePresentationRoute('/journey/'), 'journey')
})

test('all other URLs keep the existing schema presentation', () => {
  assert.equal(resolvePresentationRoute('/hightouch-meridian-schema/'), 'schema')
  assert.equal(resolvePresentationRoute('/'), 'schema')
  assert.equal(resolvePresentationRoute('/not-a-journey/'), 'schema')
})

test('journey presentation uses its requested browser title', () => {
  assert.equal(presentationTitle('journey'), 'Women’s Tops — Viewed, Not Purchased')
  assert.equal(presentationTitle('schema'), 'Meridian Retail Group — Customer Studio Schema')
})

test('journey presentation keeps a fixed 1920 by 1080 frame', () => {
  assert.deepEqual(JOURNEY_FRAME, { width: 1920, height: 1080, toolbarHeight: 66, sidebarWidth: 326 })
})

test('only the journey route enables document scrolling for shorter viewports', () => {
  assert.equal(presentationBodyClass('journey'), 'journey-route')
  assert.equal(presentationBodyClass('schema'), '')
})
