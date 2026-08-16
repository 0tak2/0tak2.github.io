import test from "node:test";
import assert from "node:assert/strict";
import {
  VIDEO_SYNTH_COLORS,
  getVideoSynthFrame,
  shouldRenderScreenFrame,
} from "../scripts/tv-screen-motion.js";

test("비디오 신시사이징 프레임은 결정적이고 값 범위를 지킨다", () => {
  assert.deepEqual(VIDEO_SYNTH_COLORS, ["#ff2fb3", "#16e7ff", "#ffe94a", "#4937ff"]);
  assert.deepEqual(getVideoSynthFrame(1234), getVideoSynthFrame(1234));

  const frame = getVideoSynthFrame(987654);
  assert.equal(frame.fields.length, 4);
  for (const field of frame.fields) {
    assert.ok(field.x >= 0 && field.x <= 1);
    assert.ok(field.y >= 0 && field.y <= 1);
    assert.ok(field.radius >= 0.2 && field.radius <= 0.75);
  }
  assert.ok(frame.feedbackScale >= 0.96 && frame.feedbackScale <= 1.02);
  assert.ok(frame.glitch >= 0 && frame.glitch <= 1);
});

test("화면 프레임은 33ms 간격과 모션 감소를 지킨다", () => {
  assert.equal(shouldRenderScreenFrame({ elapsedMs: 32, lastFrameMs: 0, reducedMotion: false, hasRendered: true }), false);
  assert.equal(shouldRenderScreenFrame({ elapsedMs: 33, lastFrameMs: 0, reducedMotion: false, hasRendered: true }), true);
  assert.equal(shouldRenderScreenFrame({ elapsedMs: 100, lastFrameMs: 0, reducedMotion: true, hasRendered: true }), false);
  assert.equal(shouldRenderScreenFrame({ elapsedMs: 0, lastFrameMs: 0, reducedMotion: true, hasRendered: false }), true);
});
