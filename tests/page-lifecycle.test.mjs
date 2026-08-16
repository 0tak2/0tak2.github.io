import test from "node:test";
import assert from "node:assert/strict";
import { shouldDestroyOnPageHide } from "../scripts/page-lifecycle.js";

test("BFCache 진입에서는 TV를 파괴하지 않는다", () => {
  assert.equal(shouldDestroyOnPageHide(true), false);
  assert.equal(shouldDestroyOnPageHide(false), true);
});
