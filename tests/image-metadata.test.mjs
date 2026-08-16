import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { hasLocationMetadata } from "../scripts/jpeg-metadata.js";

const jpegWithApp1 = (payload) => Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe1]),
  Buffer.from([0, payload.length + 2]),
  payload,
  Buffer.from([0xff, 0xd9]),
]);

test("Exif IFD0의 GPSInfoIFDPointer를 감지한다", () => {
  const exif = Buffer.from([
    ...Buffer.from("Exif\0\0", "binary"),
    0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08,
    0x00, 0x01,
    0x88, 0x25, 0x00, 0x04, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x1a,
    0x00, 0x00, 0x00, 0x00,
  ]);

  assert.equal(hasLocationMetadata(jpegWithApp1(exif)), true);
});

test("XMP의 GPS 토큰을 감지한다", () => {
  const xmp = Buffer.from("http://ns.adobe.com/xap/1.0/\0<x:xmpmeta exif:GPSLatitude=\"hidden\"/>");

  assert.equal(hasLocationMetadata(jpegWithApp1(xmp)), true);
});

test("잘린 JPEG segment를 안전한 이미지로 오판하지 않는다", () => {
  const truncated = Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x20, 0x45, 0x78]);

  assert.throws(() => hasLocationMetadata(truncated), TypeError);
});

for (const name of ["soontaek-01.jpeg", "soontaek-02.jpeg", "soontaek-03.jpeg"]) {
  test(`${name}은 GPS가 없고 비위치 EXIF를 유지한다`, async () => {
    const bytes = await readFile(new URL(`../assets/${name}`, import.meta.url));
    const text = bytes.toString("latin1");
    assert.equal(hasLocationMetadata(bytes), false);
    assert.match(text, /iPhone 14 Pro/);
    assert.match(text, /20\d{2}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/);
  });
}
