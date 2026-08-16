import test from "node:test";
import assert from "node:assert/strict";
import { clampPosition } from "../scripts/contact-card.js";

test("드래그 위치를 뷰포트의 안쪽 여백 안에 둔다", () => {
  const size = { width: 240, height: 120, viewportWidth: 1000, viewportHeight: 700, margin: 12 };

  assert.deepEqual(clampPosition({ x: -30, y: -20, ...size }), { x: 12, y: 12 });
  assert.deepEqual(clampPosition({ x: 900, y: 650, ...size }), { x: 748, y: 568 });
  assert.deepEqual(clampPosition({ x: 320, y: 240, ...size }), { x: 320, y: 240 });
});
