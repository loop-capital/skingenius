/**
 * EXIF metadata stripping for privacy-first image handling.
 * Removes APP1 (EXIF) markers from JPEG base64 data while preserving image payload.
 */

export function stripExif(base64Jpeg: string): string {
  try {
    const buffer = Buffer.from(base64Jpeg, "base64");
    let offset = 0;

    // Verify JPEG signature
    if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
      // Not a valid JPEG — return as-is (might be PNG or other format)
      return base64Jpeg;
    }

    const segments: Buffer[] = [];
    segments.push(Buffer.from([0xff, 0xd8])); // SOI marker

    offset = 2;
    while (offset < buffer.length - 1) {
      if (buffer[offset] !== 0xff) break;

      const marker = buffer[offset + 1];

      // APP1 (EXIF) — skip it
      if (marker === 0xe1) {
        const length = (buffer[offset + 2] << 8) | buffer[offset + 3];
        offset += 2 + length;
        continue;
      }

      // APP markers have length fields
      if (marker >= 0xe0 && marker <= 0xef) {
        const length = (buffer[offset + 2] << 8) | buffer[offset + 3];
        segments.push(buffer.subarray(offset, offset + 2 + length));
        offset += 2 + length;
      } else if (marker === 0xda) {
        // SOS — rest is entropy-coded data, copy everything
        segments.push(buffer.subarray(offset));
        break;
      } else if (marker === 0xdb || marker === 0xc0 || marker === 0xc4) {
        // DQT, SOF0, DHT — have length fields
        const length = (buffer[offset + 2] << 8) | buffer[offset + 3];
        segments.push(buffer.subarray(offset, offset + 2 + length));
        offset += 2 + length;
      } else {
        // Unknown marker — copy 2 bytes (marker only, no length)
        segments.push(buffer.subarray(offset, offset + 2));
        offset += 2;
      }
    }

    const result = Buffer.concat(segments);
    return result.toString("base64");
  } catch {
    console.warn("EXIF strip failed, returning original image");
    return base64Jpeg;
  }
}
