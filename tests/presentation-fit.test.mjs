import assert from 'node:assert/strict'
import test from 'node:test'

import { calculateFitScale, clampZoomMultiplier } from '../src/presentationFit.js'
import { GRAPH_HEIGHT, GRAPH_WIDTH } from '../src/schemaLayout.js'

test('fit scale keeps the complete graph inside common presentation canvases', () => {
  assert.equal(calculateFitScale(1022, 842, GRAPH_WIDTH, GRAPH_HEIGHT, 28), 0.947)
  assert.equal(calculateFitScale(948, 710, GRAPH_WIDTH, GRAPH_HEIGHT, 24), 0.882)
  assert.equal(calculateFitScale(862, 662, GRAPH_WIDTH, GRAPH_HEIGHT, 24), 0.798)
})

test('fit scale is capped at 100 percent and remains usable in constrained space', () => {
  assert.equal(calculateFitScale(1600, 1000, GRAPH_WIDTH, GRAPH_HEIGHT, 24), 1)
  assert.equal(calculateFitScale(500, 400, GRAPH_WIDTH, GRAPH_HEIGHT, 24), 0.55)
})

test('manual zoom multiplier remains within presentation-safe bounds', () => {
  assert.equal(clampZoomMultiplier(0.2), 0.72)
  assert.equal(clampZoomMultiplier(1.005), 1.01)
  assert.equal(clampZoomMultiplier(1.8), 1.28)
})
