import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { hasLocationMetadata } from "../scripts/jpeg-metadata.js";

const jpegWithApp1 = (payload) => Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe1]),
  Buffer.from([0, payload.length + 2]),
  payload,
  Buffer.from([0xff, 0xd9]),
]);

const SOS_HEADER = Buffer.from([
  0xff, 0xda, 0x00, 0x08,
  0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
]);

const jpegWithScan = (...parts) => Buffer.concat([
  Buffer.from([0xff, 0xd8]),
  SOS_HEADER,
  ...parts,
]);

const hashChunks = (chunks) => {
  const hash = createHash("sha256");
  for (const chunk of chunks) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(chunk.length);
    hash.update(length);
    hash.update(chunk);
  }
  return hash.digest("hex");
};

const getIntegritySnapshot = (bytes) => {
  const app1Chunks = [];
  const scanChunks = [];
  let offset = 2;

  while (offset < bytes.length) {
    assert.equal(bytes[offset], 0xff, "JPEG marker prefix");
    const markerStart = offset;
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;

    const segmentLength = bytes.readUInt16BE(offset);
    const payloadStart = offset + 2;
    const payloadEnd = offset + segmentLength;
    if (marker === 0xe1) app1Chunks.push(bytes.subarray(payloadStart, payloadEnd));
    offset = payloadEnd;

    if (marker !== 0xda) continue;

    const scanStart = offset;
    while (offset < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const possibleMarker = offset;
      while (bytes[offset] === 0xff) offset += 1;
      const code = bytes[offset];
      if (code === 0x00 || (code >= 0xd0 && code <= 0xd7)) {
        offset += 1;
        continue;
      }
      scanChunks.push(bytes.subarray(scanStart, possibleMarker));
      offset = possibleMarker;
      break;
    }

    assert.ok(offset > markerStart, "JPEG parser makes progress");
  }

  return {
    app1Sha256: hashChunks(app1Chunks),
    scanDataSha256: hashChunks(scanChunks),
  };
};

const EXPECTED_INTEGRITY = {
  "soontaek-01.jpeg": {
    app1Sha256: "36b076c84f2775d5f3f5e90d11fc71f9997f7f83be3f4d6465ba89b0462eeb48",
    scanDataSha256: "95f096dbeef307ffee946e406f4477c38429db6ae773e05685e127b4ed5e6e3b",
  },
  "soontaek-02.jpeg": {
    app1Sha256: "2980d90e3dba5f1cd9f6757e96460e1b2d56f3d74516d671288d853f3655029c",
    scanDataSha256: "599c9eab4454f8d872ed7f16a324d5cff6868153a3b5c9a2efc318767a9804ca",
  },
  "soontaek-03.jpeg": {
    app1Sha256: "98bba9d9d12bb76aa8d0510208e577fe2d4994aff1e71d9d21f8c4358a464811",
    scanDataSha256: "e2caf9e73148224fe83c9053f6d668e36ae68b8f9a2a061a972b05c93b4138a4",
  },
};

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

test("EOI 없이 끝난 scan을 안전한 이미지로 오판하지 않는다", () => {
  const truncated = jpegWithScan(Buffer.from([0x11, 0x22, 0xff, 0x00, 0x33]));

  assert.throws(() => hasLocationMetadata(truncated), TypeError);
});

test("scan의 stuffed byte와 restart marker를 건너뛰고 EOI를 확인한다", () => {
  const jpeg = jpegWithScan(
    Buffer.from([0x11, 0xff, 0x00, 0x22, 0xff, 0xd0, 0x33]),
    Buffer.from([0xff, 0xd9]),
  );

  assert.equal(hasLocationMetadata(jpeg), false);
});

test("여러 scan 뒤 APP1의 위치정보도 감지한다", () => {
  const xmp = Buffer.from("http://ns.adobe.com/xap/1.0/\0<x:xmpmeta exif:GPSPosition=\"hidden\"/>");
  const app1 = Buffer.concat([
    Buffer.from([0xff, 0xe1, 0x00, xmp.length + 2]),
    xmp,
  ]);
  const jpeg = jpegWithScan(
    Buffer.from([0x11]),
    SOS_HEADER,
    Buffer.from([0x22]),
    app1,
    Buffer.from([0xff, 0xd9]),
  );

  assert.equal(hasLocationMetadata(jpeg), true);
});

test("범위를 벗어난 TIFF IFD0 offset을 안전한 이미지로 오판하지 않는다", () => {
  const exif = Buffer.from([
    ...Buffer.from("Exif\0\0", "binary"),
    0x4d, 0x4d, 0x00, 0x2a, 0x7f, 0xff, 0xff, 0xff,
  ]);

  assert.throws(() => hasLocationMetadata(jpegWithApp1(exif)), TypeError);
});

for (const name of ["soontaek-01.jpeg", "soontaek-02.jpeg", "soontaek-03.jpeg"]) {
  test(`${name}은 GPS가 없고 비위치 EXIF를 유지한다`, async () => {
    const bytes = await readFile(new URL(`../assets/${name}`, import.meta.url));
    const text = bytes.toString("latin1");
    assert.equal(hasLocationMetadata(bytes), false);
    assert.match(text, /iPhone 14 Pro/);
    assert.match(text, /20\d{2}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/);
    assert.deepEqual(getIntegritySnapshot(bytes), EXPECTED_INTEGRITY[name]);
  });
}
