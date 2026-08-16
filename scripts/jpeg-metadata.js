const JPEG_MARKER_PREFIX = 0xff;
const START_OF_IMAGE = 0xd8;
const END_OF_IMAGE = 0xd9;
const START_OF_SCAN = 0xda;
const APP1 = 0xe1;
const GPS_INFO_IFD_POINTER = 0x8825;
const XMP_GPS_TOKENS = ["GPSLatitude", "GPSLongitude", "GPSPosition", "exif:GPS"];

const fail = (message) => {
  throw new TypeError(`잘못된 JPEG 메타데이터: ${message}`);
};

const requireRange = (offset, length, end, label) => {
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 || length < 0 || offset + length > end) {
    fail(`${label} 범위가 이미지 밖입니다`);
  }
};

const hasExifGpsPointer = (bytes, start, end) => {
  const tiffStart = start + 6;
  requireRange(tiffStart, 8, end, "TIFF header");

  const byteOrder = String.fromCharCode(bytes[tiffStart], bytes[tiffStart + 1]);
  if (byteOrder !== "II" && byteOrder !== "MM") fail("지원하지 않는 TIFF byte order입니다");
  const littleEndian = byteOrder === "II";
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const readUint16 = (offset, label) => {
    requireRange(offset, 2, end, label);
    return view.getUint16(offset, littleEndian);
  };
  const readUint32 = (offset, label) => {
    requireRange(offset, 4, end, label);
    return view.getUint32(offset, littleEndian);
  };

  if (readUint16(tiffStart + 2, "TIFF magic") !== 42) fail("TIFF magic 값이 올바르지 않습니다");

  const ifd0Offset = readUint32(tiffStart + 4, "IFD0 offset");
  const ifd0Start = tiffStart + ifd0Offset;
  requireRange(ifd0Start, 2, end, "IFD0");
  const entryCount = readUint16(ifd0Start, "IFD0 entry count");
  const entriesStart = ifd0Start + 2;
  requireRange(entriesStart, entryCount * 12, end, "IFD0 entries");

  for (let index = 0; index < entryCount; index += 1) {
    if (readUint16(entriesStart + index * 12, "IFD0 tag") === GPS_INFO_IFD_POINTER) return true;
  }

  return false;
};

const isExifApp1 = (bytes, start, end) => (
  end - start >= 6
  && bytes[start] === 0x45
  && bytes[start + 1] === 0x78
  && bytes[start + 2] === 0x69
  && bytes[start + 3] === 0x66
  && bytes[start + 4] === 0
  && bytes[start + 5] === 0
);

const hasXmpGpsToken = (bytes, start, end) => {
  const text = new TextDecoder("utf-8").decode(bytes.subarray(start, end));
  return XMP_GPS_TOKENS.some((token) => text.includes(token));
};

export function hasLocationMetadata(bytes) {
  if (!(bytes instanceof Uint8Array)) fail("Uint8Array가 필요합니다");
  requireRange(0, 2, bytes.length, "SOI marker");
  if (bytes[0] !== JPEG_MARKER_PREFIX || bytes[1] !== START_OF_IMAGE) fail("SOI marker가 없습니다");

  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== JPEG_MARKER_PREFIX) fail("segment marker가 없습니다");
    while (offset < bytes.length && bytes[offset] === JPEG_MARKER_PREFIX) offset += 1;
    requireRange(offset, 1, bytes.length, "segment marker");
    const marker = bytes[offset];
    offset += 1;

    if (marker === END_OF_IMAGE) return false;
    if (marker === 0x00) fail("잘못된 stuffed marker입니다");
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;

    requireRange(offset, 2, bytes.length, "segment length");
    const segmentLength = bytes[offset] * 0x100 + bytes[offset + 1];
    if (segmentLength < 2) fail("segment length가 2보다 작습니다");
    const payloadStart = offset + 2;
    const payloadEnd = offset + segmentLength;
    requireRange(payloadStart, segmentLength - 2, bytes.length, "segment payload");

    if (marker === APP1) {
      if (isExifApp1(bytes, payloadStart, payloadEnd)) {
        if (hasExifGpsPointer(bytes, payloadStart, payloadEnd)) return true;
      } else if (hasXmpGpsToken(bytes, payloadStart, payloadEnd)) {
        return true;
      }
    }

    if (marker === START_OF_SCAN) return false;
    offset = payloadEnd;
  }

  fail("EOI 또는 SOS marker가 없습니다");
}
