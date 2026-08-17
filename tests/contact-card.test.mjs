import test from "node:test";
import assert from "node:assert/strict";
import { clampPosition, getDraggedPosition, getKeyboardDelta } from "../scripts/contact-card.js";

test("드래그 위치를 뷰포트의 안쪽 여백 안에 둔다", () => {
  const size = { width: 240, height: 120, viewportWidth: 1000, viewportHeight: 700, margin: 12 };

  assert.deepEqual(clampPosition({ x: -30, y: -20, ...size }), { x: 12, y: 12 });
  assert.deepEqual(clampPosition({ x: 900, y: 650, ...size }), { x: 748, y: 568 });
  assert.deepEqual(clampPosition({ x: 320, y: 240, ...size }), { x: 320, y: 240 });
});

test("각 오버레이의 드래그 이동량을 독립적으로 계산한다", () => {
  assert.deepEqual(getDraggedPosition({
    startCard: { x: 80, y: 120 },
    startPointer: { x: 100, y: 160 },
    pointer: { x: 145, y: 190 },
    width: 160,
    height: 220,
    viewportWidth: 1000,
    viewportHeight: 700,
  }), { x: 125, y: 150 });
});

test("키보드 화살표를 이동량으로 변환한다", () => {
  assert.deepEqual(getKeyboardDelta("ArrowLeft"), { x: -12, y: 0 });
  assert.deepEqual(getKeyboardDelta("ArrowDown", 24), { x: 0, y: 24 });
  assert.equal(getKeyboardDelta("Enter"), null);
});
