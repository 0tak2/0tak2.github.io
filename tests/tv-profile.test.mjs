import test from "node:test";
import assert from "node:assert/strict";

import { TV_PROFILE, getBottomButtonPositions } from "../scripts/tv-profile.js";

test("90년대 한국형 실버 CRT의 외형을 정의한다", () => {
  assert.equal(TV_PROFILE.bodyColor, 0xb9bab6);
  assert.equal(TV_PROFILE.hasSideSpeaker, true);
  assert.equal(TV_PROFILE.hasAntenna, false);
  assert.equal(TV_PROFILE.hasLegs, false);
  assert.equal(TV_PROFILE.hasTopDials, false);
  assert.ok(TV_PROFILE.screenWidth / TV_PROFILE.bodyWidth > 0.75);
  assert.ok(TV_PROFILE.cameraDistance >= 8.5);
  assert.ok(TV_PROFILE.restingScale <= 0.9);
});

test("화면 아래 조작 버튼을 일정한 간격으로 배치한다", () => {
  assert.deepEqual(getBottomButtonPositions(4, 0.28), [-0.42, -0.14, 0.14, 0.42]);
  assert.equal(getBottomButtonPositions(6, 0.24).length, 6);
});
