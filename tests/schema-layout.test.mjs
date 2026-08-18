import assert from 'node:assert/strict'
import test from 'node:test'

import { models, relationships } from '../src/schemaData.js'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  EDGE_ROUTES,
  GRAPH_HEIGHT,
  GRAPH_WIDTH,
  NODE_LAYOUT,
  roundedOrthogonalPath,
} from '../src/schemaLayout.js'

function rectangleForNode(modelId, clearance = 0) {
  const node = NODE_LAYOUT[modelId]
  return {
    left: node.x - clearance,
    right: node.x + CARD_WIDTH + clearance,
    top: node.y - clearance,
    bottom: node.y + CARD_HEIGHT + clearance,
  }
}

function rectanglesOverlap(a, b, gap = 0) {
  return !(
    a.right + gap <= b.left ||
    b.right + gap <= a.left ||
    a.bottom + gap <= b.top ||
    b.bottom + gap <= a.top
  )
}

function segments(points) {
  return points.slice(1).map((point, index) => ({ start: points[index], end: point }))
}

function segmentEntersRectangle(segment, rectangle) {
  if (segment.start.x === segment.end.x) {
    const x = segment.start.x
    const top = Math.min(segment.start.y, segment.end.y)
    const bottom = Math.max(segment.start.y, segment.end.y)
    return x > rectangle.left && x < rectangle.right && bottom > rectangle.top && top < rectangle.bottom
  }

  const y = segment.start.y
  const left = Math.min(segment.start.x, segment.end.x)
  const right = Math.max(segment.start.x, segment.end.x)
  return y > rectangle.top && y < rectangle.bottom && right > rectangle.left && left < rectangle.right
}

function segmentIntersection(a, b) {
  const aVertical = a.start.x === a.end.x
  const bVertical = b.start.x === b.end.x

  if (aVertical === bVertical) {
    const sameTrack = aVertical ? a.start.x === b.start.x : a.start.y === b.start.y
    if (!sameTrack) return null
    const aStart = aVertical ? Math.min(a.start.y, a.end.y) : Math.min(a.start.x, a.end.x)
    const aEnd = aVertical ? Math.max(a.start.y, a.end.y) : Math.max(a.start.x, a.end.x)
    const bStart = bVertical ? Math.min(b.start.y, b.end.y) : Math.min(b.start.x, b.end.x)
    const bEnd = bVertical ? Math.max(b.start.y, b.end.y) : Math.max(b.start.x, b.end.x)
    return Math.min(aEnd, bEnd) > Math.max(aStart, bStart) ? 'overlap' : null
  }

  const vertical = aVertical ? a : b
  const horizontal = aVertical ? b : a
  const x = vertical.start.x
  const y = horizontal.start.y
  const withinVertical = y >= Math.min(vertical.start.y, vertical.end.y) && y <= Math.max(vertical.start.y, vertical.end.y)
  const withinHorizontal = x >= Math.min(horizontal.start.x, horizontal.end.x) && x <= Math.max(horizontal.start.x, horizontal.end.x)
  return withinVertical && withinHorizontal ? { x, y } : null
}

test('layout covers every model and relationship exactly once', () => {
  assert.deepEqual(Object.keys(NODE_LAYOUT).sort(), models.map(({ id }) => id).sort())
  assert.deepEqual(Object.keys(EDGE_ROUTES).sort(), relationships.map(({ id }) => id).sort())
  assert.equal(GRAPH_WIDTH, 1020)
  assert.equal(GRAPH_HEIGHT, 620)
})

test('model cards do not collide', () => {
  const collisions = []
  for (let index = 0; index < models.length; index += 1) {
    for (let comparison = index + 1; comparison < models.length; comparison += 1) {
      const first = models[index].id
      const second = models[comparison].id
      if (rectanglesOverlap(rectangleForNode(first), rectangleForNode(second))) {
        collisions.push([first, second])
      }
    }
  }
  assert.deepEqual(collisions, [])
})

test('every route is orthogonal and clears unrelated cards by 16 pixels', () => {
  const collisions = []
  for (const relationship of relationships) {
    const route = EDGE_ROUTES[relationship.id]
    assert.ok(route.points.length >= 2, relationship.id)
    for (const segment of segments(route.points)) {
      assert.ok(
        segment.start.x === segment.end.x || segment.start.y === segment.end.y,
        `${relationship.id} contains a diagonal segment`,
      )
      for (const model of models) {
        if (model.id === relationship.source || model.id === relationship.target) continue
        if (segmentEntersRectangle(segment, rectangleForNode(model.id, 16))) {
          collisions.push(`${relationship.id}>${model.id}`)
        }
      }
    }
  }
  assert.deepEqual([...new Set(collisions)], [])
})

test('relationship routes do not cross or overlap', () => {
  const crossings = []
  for (let index = 0; index < relationships.length; index += 1) {
    for (let comparison = index + 1; comparison < relationships.length; comparison += 1) {
      const first = relationships[index]
      const second = relationships[comparison]
      for (const firstSegment of segments(EDGE_ROUTES[first.id].points)) {
        for (const secondSegment of segments(EDGE_ROUTES[second.id].points)) {
          const intersection = segmentIntersection(firstSegment, secondSegment)
          if (intersection) crossings.push(`${first.id}×${second.id}`)
        }
      }
    }
  }
  assert.deepEqual([...new Set(crossings)], [])
})

test('cardinality labels clear cards and one another', () => {
  const labels = relationships.map((relationship) => {
    const label = EDGE_ROUTES[relationship.id].label
    return {
      id: relationship.id,
      left: label.x - 23,
      right: label.x + 23,
      top: label.y - 10,
      bottom: label.y + 10,
    }
  })
  const nodeCollisions = []
  const labelCollisions = []

  for (const label of labels) {
    for (const model of models) {
      if (rectanglesOverlap(label, rectangleForNode(model.id))) {
        nodeCollisions.push(`${label.id}>${model.id}`)
      }
    }
  }
  for (let index = 0; index < labels.length; index += 1) {
    for (let comparison = index + 1; comparison < labels.length; comparison += 1) {
      if (rectanglesOverlap(labels[index], labels[comparison], 12)) {
        labelCollisions.push(`${labels[index].id}×${labels[comparison].id}`)
      }
    }
  }

  assert.deepEqual(nodeCollisions, [])
  assert.deepEqual(labelCollisions, [])
})

test('customer and product ports use distinct, presentation-safe lanes', () => {
  const customerRoutes = relationships
    .filter(({ source }) => source === 'customers')
    .map(({ id }) => EDGE_ROUTES[id].points[0])
  assert.equal(new Set(customerRoutes.map(({ x, y }) => `${x},${y}`)).size, 5)

  const productEntries = ['order-items-products', 'store-purchases-products', 'digital-events-products']
    .map((id) => EDGE_ROUTES[id].points.at(-1))
  assert.equal(new Set(productEntries.map(({ x, y }) => `${x},${y}`)).size, 3)
})

test('rounded path generation retains orthogonal endpoints and soft corners', () => {
  const path = roundedOrthogonalPath([
    { x: 10, y: 10 },
    { x: 50, y: 10 },
    { x: 50, y: 60 },
  ], 10)
  assert.equal(path, 'M 10 10 L 40 10 Q 50 10 50 20 L 50 60')
})
