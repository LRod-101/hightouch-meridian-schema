export function resolvePresentationRoute(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '')
  return normalizedPath.endsWith('/journey') ? 'journey' : 'schema'
}

export function presentationTitle(route) {
  return route === 'journey'
    ? 'Women’s Tops — Viewed, Not Purchased'
    : 'Meridian Retail Group — Customer Studio Schema'
}

export function presentationBodyClass(route) {
  return route === 'journey' ? 'journey-route' : ''
}
