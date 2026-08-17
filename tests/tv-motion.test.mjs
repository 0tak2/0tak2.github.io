import test from "node:test";
import assert from "node:assert/strict";
import { clamp, getTvTransform } from "../scripts/tv-motion.js";

test("clamp는 값을 범위 안에 둔다", () => {
  assert.equal(clamp(-1, 0, 1), 0);
  assert.equal(clamp(0.4, 0, 1), 0.4);
  assert.equal(clamp(2, 0, 1), 1);
});

test("TV는 진입 후 머물고 스크롤 시 퇴장한다", () => {
  const entering = getTvTransform({ introProgress: 0, scrollProgress: 0, pointerX: 0, pointerY: 0, reducedMotion: false });
  const resting = getTvTransform({ introProgress: 1, scrollProgress: 0, pointerX: 0, pointerY: 0, reducedMotion: false });
  const leaving = getTvTransform({ introProgress: 1, scrollProgress: 1, pointerX: 0, pointerY: 0, reducedMotion: false });

  assert.ok(entering.x > 1);
  assert.equal(resting.x, 0);
  assert.ok(leaving.x < -1);
});

test("포인터 값은 회전을 제한한다", () => {
  const value = getTvTransform({ scrollProgress: 0.25, pointerX: 9, pointerY: -9, reducedMotion: false });

  assert.ok(value.rotationY <= 0.18);
  assert.ok(value.rotationX >= -0.12);
});

test("모션 감소 환경은 정적인 중앙값을 반환한다", () => {
  assert.deepEqual(
    getTvTransform({ scrollProgress: 1, pointerX: 1, pointerY: 1, reducedMotion: true }),
    { x: 0, y: 0, rotationX: 0, rotationY: -0.08, scale: 1 },
  );
});
