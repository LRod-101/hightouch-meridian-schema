import assert from 'node:assert/strict'
import test from 'node:test'

import {
  connectedModelIds,
  modelById,
  models,
  relationships,
} from '../src/schemaData.js'

test('Meridian schema mirrors the current ten-table ERD', () => {
  assert.equal(models.length, 10)
  assert.deepEqual(
    models.filter((model) => model.type === 'parent').map((model) => model.id),
    ['customers'],
  )
  assert.equal(relationships.length, 11)
  assert.equal(modelById.customers.name, 'Customers')
})

test('Customers exposes the five direct audience relationship paths', () => {
  assert.deepEqual(connectedModelIds('customers').sort(), [
    'digital-events',
    'loyalty-membership',
    'message-engagements',
    'online-orders',
    'store-purchases',
  ])
})

test('all relationship endpoints resolve to known models', () => {
  for (const relationship of relationships) {
    assert.ok(modelById[relationship.source], relationship.source)
    assert.ok(modelById[relationship.target], relationship.target)
  }
})

test('fact and event relationships read consistently toward their dimensions', () => {
  const relationshipById = Object.fromEntries(
    relationships.map((relationship) => [relationship.id, relationship]),
  )

  assert.deepEqual(relationshipById['order-items-products'], {
    id: 'order-items-products',
    source: 'order-items',
    target: 'products',
    label: 'many:1',
  })
  assert.deepEqual(relationshipById['store-purchases-stores'], {
    id: 'store-purchases-stores',
    source: 'store-purchases',
    target: 'stores',
    label: 'many:1',
  })
  assert.deepEqual(relationshipById['store-purchases-products'], {
    id: 'store-purchases-products',
    source: 'store-purchases',
    target: 'products',
    label: 'many:1',
  })
  assert.deepEqual(relationshipById['digital-events-products'], {
    id: 'digital-events-products',
    source: 'digital-events',
    target: 'products',
    label: 'many:1',
  })
  assert.deepEqual(relationshipById['products-product-categories'], {
    id: 'products-product-categories',
    source: 'products',
    target: 'product-categories',
    label: 'many:1',
  })
})
