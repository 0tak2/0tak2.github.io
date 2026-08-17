import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  TV_SCREEN_COPY,
  createScreenFrameRenderer,
  drawVideoSynthFrame,
} from "../scripts/tv-screen-render.js";

test("거부된 일반 프레임은 texture와 장면을 갱신하지 않고 리사이즈만 장면을 다시 렌더한다", () => {
  const updates = [];
  let renders = 0;
  const screenFrameRenderer = createScreenFrameRenderer({
    reducedMotion: false,
    screenSurface: { update: (elapsedMs) => updates.push(elapsedMs) },
    renderScene: () => { renders += 1; },
  });

  screenFrameRenderer.render(0);
  screenFrameRenderer.render(32);
  screenFrameRenderer.renderAfterResize();

  assert.deepEqual(updates, [0]);
  assert.equal(renders, 2);
});

test("모션 감소는 첫 화면 프레임만 렌더한다", () => {
  const updates = [];
  let renders = 0;
  const screenFrameRenderer = createScreenFrameRenderer({
    reducedMotion: true,
    screenSurface: { update: (elapsedMs) => updates.push(elapsedMs) },
    renderScene: () => { renders += 1; },
  });

  screenFrameRenderer.render(0);
  screenFrameRenderer.render(100);

  assert.deepEqual(updates, [0]);
  assert.equal(renders, 1);
});

test("신시사이징 overlay는 코드, 주사선, 노이즈 순으로 그린다", () => {
  const operations = [];
  const context = {
    globalCompositeOperation: "source-over",
    fillStyle: "",
    createRadialGradient: () => ({ addColorStop() {} }),
    fillRect() { operations.push(["fillRect", this.fillStyle]); },
    fillText(text) { operations.push(["fillText", this.fillStyle, text]); },
    drawImage() {},
    save() {},
    restore() {},
    translate() {},
    scale() {},
  };
  const frame = {
    fields: Array.from({ length: 4 }, () => ({ x: 0.5, y: 0.5, radius: 0.4 })),
    feedbackScale: 1,
    glitch: 0.5,
    scanlineOffset: 0,
  };

  drawVideoSynthFrame({
    context,
    canvas: { width: 24, height: 16 },
    feedbackCanvas: {},
    feedbackContext: { drawImage() {} },
    frame,
    elapsedMs: 0,
    hasRendered: false,
  });

  const lastCode = operations.findLastIndex(([kind]) => kind === "fillText");
  const scanlines = operations.findIndex(([kind, fillStyle], index) => (
    index > lastCode && kind === "fillRect" && fillStyle === "rgba(0, 0, 0, 0.22)"
  ));
  const noise = operations.findIndex(([kind, fillStyle], index) => (
    index > scanlines && kind === "fillRect" && fillStyle.startsWith("rgba(255, 255, 255,")
  ));

  assert.ok(lastCode < scanlines);
  assert.ok(scanlines < noise);
});

test("3D TV와 대체 화면은 동일한 의사 코드를 표시한다", async () => {
  const expectedCopy = [
    "function doWork(with: Team): Promise<Result> {",
    "  return compile(team.imagination);",
    "}",
    "",
    "await doWork(with: you);",
  ];
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const operations = [];
  const context = {
    globalCompositeOperation: "source-over",
    fillStyle: "",
    createRadialGradient: () => ({ addColorStop() {} }),
    fillRect() {},
    fillText(text) { operations.push(text); },
    drawImage() {},
    save() {},
    restore() {},
    translate() {},
    scale() {},
  };
  const frame = {
    fields: Array.from({ length: 4 }, () => ({ x: 0.5, y: 0.5, radius: 0.4 })),
    feedbackScale: 1,
    glitch: 0.5,
    scanlineOffset: 0,
  };

  drawVideoSynthFrame({
    context,
    canvas: { width: 24, height: 16 },
    feedbackCanvas: {},
    feedbackContext: { drawImage() {} },
    frame,
    elapsedMs: 0,
    hasRendered: false,
  });

  assert.deepEqual(TV_SCREEN_COPY, expectedCopy);
  assert.deepEqual(operations.filter((_, index) => index % 3 === 0), expectedCopy);
  assert.match(html, /function doWork\(with: Team\): Promise&lt;Result&gt; \{<br>\s*return compile\(team\.imagination\);<br>\}<br><br>await doWork\(with: you\);/);
});
