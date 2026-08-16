export const VIDEO_SYNTH_COLORS = ["#ff2fb3", "#16e7ff", "#ffe94a", "#4937ff"];

const normalizeElapsedMs = (elapsedMs) => (
  Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0
);

export function getVideoSynthFrame(elapsedMs) {
  const time = normalizeElapsedMs(elapsedMs) / 1000;
  const fields = VIDEO_SYNTH_COLORS.map((_, index) => {
    const phase = time * (0.72 + index * 0.11) + index * 1.73;

    return {
      x: 0.5 + Math.sin(phase) * 0.3,
      y: 0.5 + Math.cos(phase * 0.87) * 0.26,
      radius: 0.475 + Math.sin(phase * 1.13) * 0.15,
    };
  });

  return {
    fields,
    feedbackScale: 0.99 + Math.sin(time * 1.2) * 0.03,
    glitch: 0.5 + Math.sin(time * 3.7) * 0.5,
    scanlineOffset: (time * 0.18) % 1,
  };
}

export function shouldRenderScreenFrame({ elapsedMs, lastFrameMs, reducedMotion, hasRendered }) {
  if (!hasRendered) return true;
  if (reducedMotion) return false;

  return normalizeElapsedMs(elapsedMs) - normalizeElapsedMs(lastFrameMs) >= 33;
}
