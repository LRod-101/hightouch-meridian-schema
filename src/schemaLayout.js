export const CARD_WIDTH = 164
export const CARD_HEIGHT = 54
export const GRAPH_WIDTH = 1020
export const GRAPH_HEIGHT = 620

export const NODE_LAYOUT = {
  customers: { x: 40, y: 260 },
  'loyalty-membership': { x: 300, y: 60 },
  'online-orders': { x: 300, y: 150 },
  'store-purchases': { x: 300, y: 260 },
  'digital-events': { x: 300, y: 370 },
  'message-engagements': { x: 300, y: 480 },
  'order-items': { x: 580, y: 150 },
  stores: { x: 580, y: 260 },
  products: { x: 580, y: 370 },
  'product-categories': { x: 830, y: 370 },
}

export const EDGE_ROUTES = {
  'customers-loyalty': {
    points: [{ x: 108, y: 260 }, { x: 108, y: 87 }, { x: 300, y: 87 }],
    label: { x: 258, y: 87 },
  },
  'customers-online-orders': {
    points: [{ x: 160, y: 260 }, { x: 160, y: 177 }, { x: 300, y: 177 }],
    label: { x: 258, y: 177 },
  },
  'online-orders-order-items': {
    points: [{ x: 464, y: 177 }, { x: 580, y: 177 }],
    label: { x: 522, y: 177 },
  },
  'order-items-products': {
    points: [
      { x: 744, y: 177 },
      { x: 786, y: 177 },
      { x: 786, y: 330 },
      { x: 700, y: 330 },
      { x: 700, y: 370 },
    ],
    label: { x: 786, y: 244 },
  },
  'products-product-categories': {
    points: [{ x: 744, y: 397 }, { x: 830, y: 397 }],
    label: { x: 787, y: 397 },
  },
  'customers-store-purchases': {
    points: [{ x: 204, y: 287 }, { x: 300, y: 287 }],
    label: { x: 252, y: 287 },
  },
  'store-purchases-stores': {
    points: [{ x: 464, y: 275 }, { x: 580, y: 275 }],
    label: { x: 522, y: 275 },
  },
  'store-purchases-products': {
    points: [
      { x: 464, y: 299 },
      { x: 536, y: 299 },
      { x: 536, y: 342 },
      { x: 620, y: 342 },
      { x: 620, y: 370 },
    ],
    label: { x: 578, y: 342 },
  },
  'customers-digital-events': {
    points: [{ x: 160, y: 314 }, { x: 160, y: 397 }, { x: 300, y: 397 }],
    label: { x: 258, y: 397 },
  },
  'digital-events-products': {
    points: [{ x: 464, y: 397 }, { x: 580, y: 397 }],
    label: { x: 522, y: 397 },
  },
  'customers-message-engagements': {
    points: [{ x: 108, y: 314 }, { x: 108, y: 507 }, { x: 300, y: 507 }],
    label: { x: 258, y: 507 },
  },
}

function distance(first, second) {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y)
}

function pointToward(origin, destination, amount) {
  if (origin.x === destination.x) {
    return { x: origin.x, y: origin.y + Math.sign(destination.y - origin.y) * amount }
  }
  return { x: origin.x + Math.sign(destination.x - origin.x) * amount, y: origin.y }
}

function coordinate(value) {
  return Number(value.toFixed(2))
}

export function roundedOrthogonalPath(points, cornerRadius = 12) {
  if (points.length < 2) return ''

  const commands = [`M ${coordinate(points[0].x)} ${coordinate(points[0].y)}`]
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    const next = points[index + 1]
    const radius = Math.min(cornerRadius, distance(previous, current) / 2, distance(current, next) / 2)
    const beforeCorner = pointToward(current, previous, radius)
    const afterCorner = pointToward(current, next, radius)
    commands.push(`L ${coordinate(beforeCorner.x)} ${coordinate(beforeCorner.y)}`)
    commands.push(
      `Q ${coordinate(current.x)} ${coordinate(current.y)} ${coordinate(afterCorner.x)} ${coordinate(afterCorner.y)}`,
    )
  }

  const finalPoint = points.at(-1)
  commands.push(`L ${coordinate(finalPoint.x)} ${coordinate(finalPoint.y)}`)
  return commands.join(' ')
}
