export const TV_PROFILE = Object.freeze({
  bodyColor: 0xb9bab6,
  bodyWidth: 4.5,
  bodyHeight: 3.3,
  bodyDepth: 1.75,
  screenWidth: 3.5,
  screenHeight: 2.18,
  buttonCount: 6,
  cameraDistance: 8.8,
  restingScale: 0.88,
  hasSideSpeaker: true,
  hasAntenna: false,
  hasLegs: false,
  hasTopDials: false,
});

export function getBottomButtonPositions(count, spacing) {
  const start = -((count - 1) * spacing) / 2;
  return Array.from({ length: count }, (_, index) => Number((start + index * spacing).toFixed(2)));
}
