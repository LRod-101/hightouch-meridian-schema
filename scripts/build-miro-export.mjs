import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import { models, relationships } from '../src/schemaData.js'

const outputPath = path.join(process.cwd(), 'dist', 'miro-schema.html')
const svgOutputPath = path.join(process.cwd(), 'dist', 'miro-schema.svg')
const WIDTH = 1440
const HEIGHT = 900
const SIDEBAR = 190
const LIBRARY = 260
const TOOLBAR = 64
const CARD_W = 190
const CARD_H = 58

const positions = {
  customers: [250, 392],
  'loyalty-membership': [500, 155],
  'online-orders': [500, 245],
  'store-purchases': [500, 335],
  'digital-events': [500, 425],
  'message-engagements': [500, 515],
  'order-items': [755, 245],
  stores: [755, 335],
  products: [755, 425],
  'product-categories': [970, 425],
}

const colors = {
  parent: { tile: '#ded5ff', ink: '#6e5ac8', glyph: '◆' },
  related: { tile: '#bcebc8', ink: '#248a4c', glyph: '▦' },
  event: { tile: '#c9eff8', ink: '#178ba7', glyph: '✦' },
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function text(x, y, value, size = 12, options = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" ${options}>${escapeXml(value)}</text>`
}

function modelCard(model, x, y, width = CARD_W, height = CARD_H, compact = false) {
  const theme = colors[model.type]
  const tile = compact ? 34 : 36
  const iconX = x + 12
  const iconY = y + (height - tile) / 2
  const copyX = iconX + tile + 11

  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="10" fill="#ffffff" stroke="#dfe4e6" filter="url(#cardShadow)"/>
      <rect x="${iconX}" y="${iconY}" width="${tile}" height="${tile}" rx="8" fill="${theme.tile}"/>
      ${text(iconX + tile / 2, iconY + tile / 2 + 5, theme.glyph, compact ? 15 : 16, `text-anchor="middle" font-weight="700" fill="${theme.ink}"`)}
      ${text(copyX, y + (compact ? 19 : 21), model.eyebrow, compact ? 9 : 10, 'fill="#74797b"')}
      ${text(copyX, y + (compact ? 38 : 41), model.name, compact ? 11 : 12, 'font-weight="600" fill="#303337"')}
    </g>`
}

function relationshipPath(relationship) {
  const [sx, sy] = positions[relationship.source]
  const [tx, ty] = positions[relationship.target]
  const startX = sx + CARD_W
  const startY = sy + CARD_H / 2
  const endX = tx
  const endY = ty + CARD_H / 2
  const bend = Math.max(42, Math.abs(endX - startX) * 0.44)
  const path = `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`
  const lx = (startX + endX) / 2
  const ly = (startY + endY) / 2
  return `
    <path d="${path}" fill="none" stroke="#6bc7dc" stroke-width="1.6"/>
    <circle cx="${startX}" cy="${startY}" r="3" fill="#fff" stroke="#64c1d7" stroke-width="1.4"/>
    <circle cx="${endX}" cy="${endY}" r="3" fill="#fff" stroke="#64c1d7" stroke-width="1.4"/>
    <rect x="${lx - 22}" y="${ly - 9}" width="44" height="18" rx="9" fill="#fff" stroke="#9fd9e6"/>
    ${text(lx, ly + 3, relationship.label, 8, 'text-anchor="middle" fill="#5b7e86"')}`
}

function navRow(y, label, icon, active = false) {
  if (active) {
    return `
      <rect x="31" y="${y - 19}" width="142" height="34" rx="7" fill="#fff" filter="url(#softShadow)"/>
      <rect x="31" y="${y - 11}" width="2" height="18" rx="1" fill="#1c91aa"/>
      ${text(48, y + 3, label, 11, 'font-weight="600" fill="#157f98"')}`
  }
  return `${text(27, y + 3, icon, 13, 'fill="#73787b"')}${text(51, y + 3, label, 11, 'fill="#64686b"')}`
}

const relationshipSvg = relationships.map(relationshipPath).join('')
const cardSvg = models.map((model) => {
  const [x, y] = positions[model.id]
  return modelCard(model, x, y)
}).join('')
const libraryCards = models.map((model, index) => modelCard(model, 1194, 86 + index * 68, 232, 56, true)).join('')
const studioItems = ['Audiences', 'Journeys', 'Profiles', 'Priority lists', 'Traits', 'Schema', 'Governance', 'Templates']
const studioNav = studioItems.map((item, index) => navRow(350 + index * 37, item, '', item === 'Schema')).join('')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#1f2b31" flood-opacity="0.09"/></filter>
    <filter id="softShadow" x="-20%" y="-40%" width="140%" height="180%"><feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#263036" flood-opacity="0.12"/></filter>
    <clipPath id="screenClip"><rect width="${WIDTH}" height="${HEIGHT}" rx="4"/></clipPath>
  </defs>
  <g clip-path="url(#screenClip)" font-family="Arial, Helvetica, sans-serif">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#f7f9fa"/>
    <rect x="0" y="0" width="${SIDEBAR}" height="${HEIGHT}" fill="#f3f5f5"/>
    <rect x="${SIDEBAR}" y="0" width="${WIDTH - SIDEBAR - LIBRARY}" height="${HEIGHT}" fill="#fbfcfc"/>
    <rect x="${WIDTH - LIBRARY}" y="0" width="${LIBRARY}" height="${HEIGHT}" fill="#f7f8f8"/>
    <line x1="${SIDEBAR}" y1="0" x2="${SIDEBAR}" y2="${HEIGHT}" stroke="#dfe4e6"/>
    <line x1="${WIDTH - LIBRARY}" y1="0" x2="${WIDTH - LIBRARY}" y2="${HEIGHT}" stroke="#dfe4e6"/>
    <rect x="${SIDEBAR}" y="0" width="${WIDTH - SIDEBAR - LIBRARY}" height="${TOOLBAR}" fill="#fff"/>
    <line x1="${SIDEBAR}" y1="${TOOLBAR}" x2="${WIDTH - LIBRARY}" y2="${TOOLBAR}" stroke="#e5e9ea"/>

    <rect x="16" y="22" width="10" height="10" fill="#111"/><rect x="27" y="11" width="15" height="15" fill="#111"/>
    ${text(51, 29, 'hightouch', 21, 'font-weight="700" fill="#17191b"')}${text(162, 27, '▯', 17, 'fill="#73787b"')}
    <rect x="14" y="52" width="162" height="38" rx="7" fill="#fff" stroke="#dfe3e4"/>
    ${text(26, 76, 'Meridian Retail Group', 11, 'fill="#505356"')}${text(163, 76, '⌄', 13, 'text-anchor="middle" fill="#777c7f"')}
    ${navRow(126, 'Home', '⌂')}${navRow(164, 'Agents', '✦')}${navRow(202, 'Activation', '◉')}
    ${text(27, 250, '◎', 14, 'fill="#16819a"')}${text(51, 250, 'Customer Studio', 11, 'font-weight="600" fill="#16819a"')}
    <line x1="29" y1="275" x2="29" y2="645" stroke="#dfe3e5"/>
    ${studioNav}
    ${navRow(830, 'Settings', '⚙')}${navRow(868, 'Docs + Support', '?')}

    ${text(216, 39, 'Schema', 24, 'font-weight="700" fill="#2b2d30"')}
    <rect x="330" y="16" width="285" height="34" rx="7" fill="#fff" stroke="#dfe3e5"/>
    <circle cx="349" cy="33" r="7" fill="#d9f2ff"/>${text(349, 37, '❄', 10, 'text-anchor="middle" fill="#249dd0"')}
    ${text(365, 37, 'Customer Data Platform', 11, 'fill="#4e5255"')}${text(597, 37, '⌄', 13, 'text-anchor="middle" fill="#777c7f"')}
    <rect x="1068" y="15" width="91" height="35" rx="8" fill="#16839b"/>${text(1113, 37, 'Create  ⌄', 11, 'text-anchor="middle" font-weight="700" fill="#fff"')}

    ${relationshipSvg}${cardSvg}

    <rect x="209" y="742" width="176" height="118" rx="8" fill="#fafcfc" stroke="#e2e6e7"/>
    <rect x="219" y="752" width="156" height="98" fill="none" stroke="#cfe1e5"/>
    <g opacity="0.85"><rect x="227" y="771" width="18" height="7" fill="#b8a8ee"/><rect x="260" y="780" width="18" height="7" fill="#88d2a2"/><rect x="299" y="799" width="18" height="7" fill="#9ddbea"/><rect x="330" y="817" width="18" height="7" fill="#88d2a2"/><rect x="255" y="831" width="18" height="7" fill="#9ddbea"/></g>
    ${text(1018, 839, '100%', 10, 'fill="#8a9093"')}
    <rect x="1059" y="815" width="100" height="42" rx="8" fill="#fff" stroke="#e0e4e6" filter="url(#softShadow)"/>
    ${text(1076, 842, '+', 20, 'text-anchor="middle" fill="#4d5356"')}${text(1109, 841, '−', 20, 'text-anchor="middle" fill="#4d5356"')}${text(1141, 840, '⌗', 16, 'text-anchor="middle" fill="#4d5356"')}
    <line x1="1092" y1="815" x2="1092" y2="857" stroke="#e7eaeb"/><line x1="1125" y1="815" x2="1125" y2="857" stroke="#e7eaeb"/>

    <rect x="1194" y="16" width="232" height="36" rx="7" fill="#fff" stroke="#dfe3e4"/>
    ${text(1210, 39, '⌕', 17, 'fill="#777c7f"')}${text(1232, 38, 'Search all models...', 11, 'fill="#7b8083"')}${text(1411, 39, '▯', 14, 'text-anchor="middle" fill="#697074"')}
    ${libraryCards}
  </g>
</svg>`

const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Meridian Customer Studio — Schema</title><meta name="screen:name" content="Meridian Customer Studio — Schema"></head><body style="margin:0;width:100vw;height:100vh;overflow:hidden;background:#eef2f4"><img src="${svgDataUrl}" alt="Meridian Customer Studio schema with Customers as the parent model and Meridian retail related and event models" width="100%" height="100%" style="display:block;width:100%;height:100%;object-fit:contain"></body></html>`

await Promise.all([
  writeFile(outputPath, html),
  writeFile(svgOutputPath, svg),
])
process.stdout.write(`Created sanitizer-safe Miro export ${outputPath}\n`)
