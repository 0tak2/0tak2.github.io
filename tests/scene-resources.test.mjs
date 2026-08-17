import test from "node:test";
import assert from "node:assert/strict";

import { disposeSceneResources } from "../scripts/scene-resources.js";

test("공유 geometry와 material을 각각 한 번만 해제한다", () => {
  const calls = { geometry: 0, material: 0, secondMaterial: 0 };
  const geometry = { dispose: () => { calls.geometry += 1; } };
  const material = { dispose: () => { calls.material += 1; } };
  const secondMaterial = { dispose: () => { calls.secondMaterial += 1; } };
  const objects = [
    { geometry, material },
    { geometry, material: [material, secondMaterial] },
  ];
  const root = { traverse: (visitor) => objects.forEach(visitor) };

  disposeSceneResources(root);

  assert.deepEqual(calls, { geometry: 1, material: 1, secondMaterial: 1 });
});
