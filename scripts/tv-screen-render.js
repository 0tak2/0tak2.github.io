import { VIDEO_SYNTH_COLORS, shouldRenderScreenFrame } from "./tv-screen-motion.js";

export const TV_SCREEN_COPY = Object.freeze([
  "function doWork(with: Team): Promise<Result> {",
  "  return compile(team.imagination);",
  "}",
  "",
  "await doWork(with: you);",
]);

export function createScreenFrameRenderer({ reducedMotion, screenSurface, renderScene }) {
  let hasScreenRendered = false;
  let lastScreenFrameMs = 0;

  function refreshScreenTexture(elapsedMs) {
    if (!shouldRenderScreenFrame({
      elapsedMs,
      lastFrameMs: lastScreenFrameMs,
      reducedMotion,
      hasRendered: hasScreenRendered,
    })) return;

    screenSurface.update(elapsedMs);
    hasScreenRendered = true;
    lastScreenFrameMs = elapsedMs;
  }

  function render(elapsedMs) {
    refreshScreenTexture(elapsedMs);
    renderScene();
  }

  function renderAfterResize() {
    renderScene();
  }

  return { render, renderAfterResize };
}

export function drawVideoSynthFrame({
  context,
  canvas,
  feedbackCanvas,
  feedbackContext,
  frame,
  elapsedMs,
  hasRendered,
}) {
  const { width, height } = canvas;

  if (hasRendered) feedbackContext.drawImage(canvas, 0, 0);

  context.globalCompositeOperation = "source-over";
  context.fillStyle = hasRendered ? "rgba(5, 7, 16, 0.32)" : "#050710";
  context.fillRect(0, 0, width, height);

  context.globalCompositeOperation = "screen";
  frame.fields.forEach((field, index) => {
    const color = VIDEO_SYNTH_COLORS[index];
    const x = field.x * width;
    const y = field.y * height;
    const radius = field.radius * Math.max(width, height);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `${color}cc`);
    gradient.addColorStop(0.5, `${color}66`);
    gradient.addColorStop(1, "transparent");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  });

  context.globalCompositeOperation = "source-over";
  if (hasRendered) {
    context.save();
    context.globalAlpha = 0.18;
    context.translate(width / 2, height / 2);
    context.scale(frame.feedbackScale, frame.feedbackScale);
    context.translate(-width / 2, -height / 2);
    context.drawImage(feedbackCanvas, 0, 0);
    context.restore();
  }

  const jitter = Math.round((frame.glitch - 0.5) * 18);
  context.font = "30px ui-monospace, SFMono-Regular, Menlo, monospace";
  TV_SCREEN_COPY.forEach((line, index) => {
    const y = 92 + index * 92;
    context.fillStyle = "rgba(255, 47, 179, 0.72)";
    context.fillText(line, 70 + jitter, y);
    context.fillStyle = "rgba(22, 231, 255, 0.72)";
    context.fillText(line, 70 - jitter, y + 2);
    context.fillStyle = "rgba(255, 255, 255, 0.82)";
    context.fillText(line, 70, y + 1);
  });

  context.fillStyle = "rgba(0, 0, 0, 0.22)";
  for (let y = frame.scanlineOffset * 8 - 8; y < height; y += 8) {
    context.fillRect(0, y, width, 2);
  }

  context.fillStyle = `rgba(255, 255, 255, ${0.035 + frame.glitch * 0.05})`;
  for (let index = 0; index < 90; index += 1) {
    const x = (elapsedMs * (index + 3) * 0.043) % width;
    const y = (elapsedMs * (index + 11) * 0.071) % height;
    context.fillRect(x, y, 1 + (index % 3), 1);
  }
}
