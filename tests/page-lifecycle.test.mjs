import test from "node:test";
import assert from "node:assert/strict";
import { createPageHideHandler, shouldDestroyOnPageHide } from "../scripts/page-lifecycle.js";

test("BFCache 진입에서는 TV를 파괴하지 않는다", () => {
  assert.equal(shouldDestroyOnPageHide(true), false);
  assert.equal(shouldDestroyOnPageHide(false), true);
});

test("BFCache 복귀 뒤 실제 이탈에서도 정리는 정확히 한 번만 실행한다", () => {
  let cleanupCount = 0;
  const onPageHide = createPageHideHandler(() => {
    cleanupCount += 1;
  });

  assert.equal(onPageHide({ persisted: true }), false);
  assert.equal(onPageHide({ persisted: false }), true);
  assert.equal(onPageHide({ persisted: false }), false);
  assert.equal(cleanupCount, 1);
});
