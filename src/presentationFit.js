function roundScale(value) {
  return Number(value.toFixed(3))
}

export function calculateFitScale(
  containerWidth,
  containerHeight,
  graphWidth,
  graphHeight,
  padding = 24,
) {
  if (!containerWidth || !containerHeight || !graphWidth || !graphHeight) return 1
  const availableWidth = Math.max(0, containerWidth - padding * 2)
  const availableHeight = Math.max(0, containerHeight - padding * 2)
  return roundScale(Math.max(0.55, Math.min(1, availableWidth / graphWidth, availableHeight / graphHeight)))
}

export function clampZoomMultiplier(value) {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100
  return Math.min(1.28, Math.max(0.72, rounded))
}
