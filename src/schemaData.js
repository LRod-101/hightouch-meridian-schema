export const models = [
  {
    id: 'customers',
    name: 'Customers',
    type: 'parent',
    eyebrow: 'Parent Model',
    icon: 'deployed_code',
    x: 24,
    y: 242,
    searchableTerms: ['customer', 'profile', 'customer_id', 'email_opt_in', 'sms_opt_in'],
  },
  {
    id: 'loyalty-membership',
    name: 'Loyalty Membership',
    type: 'related',
    eyebrow: 'Related Model',
    icon: 'database',
    x: 252,
    y: 72,
    searchableTerms: ['loyalty', 'tier', 'points', 'membership'],
  },
  {
    id: 'online-orders',
    name: 'Online Orders',
    type: 'related',
    eyebrow: 'Related Model',
    icon: 'database',
    x: 252,
    y: 142,
    searchableTerms: ['order', 'online', 'ecommerce', 'purchase'],
  },
  {
    id: 'store-purchases',
    name: 'Store Purchases',
    type: 'event',
    eyebrow: 'Event',
    icon: 'flare',
    x: 252,
    y: 212,
    searchableTerms: ['store', 'purchase', 'offline', 'transaction'],
  },
  {
    id: 'digital-events',
    name: 'Digital Events',
    type: 'event',
    eyebrow: 'Event',
    icon: 'flare',
    x: 252,
    y: 282,
    searchableTerms: ['product viewed', 'browse', 'website', 'app', 'session', 'event'],
  },
  {
    id: 'message-engagements',
    name: 'Message Engagements',
    type: 'event',
    eyebrow: 'Event',
    icon: 'flare',
    x: 252,
    y: 352,
    searchableTerms: ['braze', 'campaign', 'message', 'open', 'click', 'conflict'],
  },
  {
    id: 'order-items',
    name: 'Order Items',
    type: 'related',
    eyebrow: 'Related Model',
    icon: 'database',
    x: 492,
    y: 142,
    searchableTerms: ['line item', 'order', 'sku', 'purchase'],
  },
  {
    id: 'stores',
    name: 'Stores',
    type: 'related',
    eyebrow: 'Related Model',
    icon: 'database',
    x: 492,
    y: 212,
    searchableTerms: ['store', 'location', 'region', 'city'],
  },
  {
    id: 'products',
    name: 'Products',
    type: 'related',
    eyebrow: 'Related Model',
    icon: 'database',
    x: 492,
    y: 282,
    searchableTerms: ['product', 'sku', 'brand', 'catalog'],
  },
  {
    id: 'product-categories',
    name: 'Product Categories',
    type: 'related',
    eyebrow: 'Related Model',
    icon: 'database',
    x: 690,
    y: 282,
    searchableTerms: ["women's tops", 'category', 'department', 'subcategory'],
  },
]

export const relationships = [
  {
    id: 'customers-loyalty',
    source: 'customers',
    target: 'loyalty-membership',
    label: '1:1',
    note: 'Conceptually one-to-zero-or-one because loyalty membership is optional.',
  },
  { id: 'customers-online-orders', source: 'customers', target: 'online-orders', label: '1:many' },
  { id: 'online-orders-order-items', source: 'online-orders', target: 'order-items', label: '1:many' },
  { id: 'order-items-products', source: 'order-items', target: 'products', label: 'many:1' },
  { id: 'products-product-categories', source: 'products', target: 'product-categories', label: 'many:1' },
  { id: 'customers-store-purchases', source: 'customers', target: 'store-purchases', label: '1:many' },
  { id: 'store-purchases-stores', source: 'store-purchases', target: 'stores', label: 'many:1' },
  { id: 'store-purchases-products', source: 'store-purchases', target: 'products', label: 'many:1' },
  {
    id: 'customers-digital-events',
    source: 'customers',
    target: 'digital-events',
    label: '1:many',
    note: 'Identified events join to Customers; anonymous events may not have a customer_id yet.',
  },
  { id: 'digital-events-products', source: 'digital-events', target: 'products', label: 'many:1' },
  { id: 'customers-message-engagements', source: 'customers', target: 'message-engagements', label: '1:many' },
]

export const modelById = Object.fromEntries(models.map((model) => [model.id, model]))

export function connectedModelIds(modelId) {
  const connected = new Set()

  for (const relationship of relationships) {
    if (relationship.source === modelId) connected.add(relationship.target)
    if (relationship.target === modelId) connected.add(relationship.source)
  }

  return [...connected]
}
