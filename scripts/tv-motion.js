export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function getTvTransform({ introProgress = 1, scrollProgress, pointerX, pointerY, reducedMotion }) {
  if (reducedMotion) {
    return {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: -0.08,
      scale: 1,
    };
  }

  const progress = clamp(scrollProgress, 0, 1);
  const enter = clamp(introProgress, 0, 1);
  const exit = clamp((progress - 0.55) / 0.45, 0, 1);

  return {
    x: 1.35 * (1 - enter) - 1.55 * exit,
    y: 0.08 * (1 - enter) + 0.22 * exit,
    rotationX: clamp(pointerY, -1, 1) * -0.12,
    rotationY: -0.08 + clamp(pointerX, -1, 1) * 0.18,
    scale: 0.94 + 0.06 * enter - 0.08 * exit,
  };
}
