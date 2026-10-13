/**
 * Fixes WebM files produced by MediaRecorder in Chrome/Firefox.
 * MediaRecorder produces WebM files with missing or zero duration in the EBML header,
 * which causes players like VLC, Windows Media Player, and GNOME Videos to show 0:00 or 0:02 duration.
 * This utility writes the accurate duration into the WebM Segment Info header.
 */

export async function fixWebmDuration(blob, durationMs) {
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    const uint8 = new Uint8Array(arrayBuffer);

    // Search for EBML Segment (0x18538067) and Info (0x1549A966)
    let infoPos = -1;
    for (let i = 0; i < Math.min(uint8.length - 4, 8192); i++) {
      if (
        uint8[i] === 0x15 &&
        uint8[i + 1] === 0x49 &&
        uint8[i + 2] === 0xa9 &&
        uint8[i + 3] === 0x66
      ) {
        infoPos = i;
        break;
      }
    }

    if (infoPos === -1) {
      // Info element not found in first 8KB, return original blob
      return blob;
    }

    // Search for Duration tag (0x44 0x89) inside Info element
    let durationPos = -1;
    for (let i = infoPos; i < Math.min(infoPos + 512, uint8.length - 3); i++) {
      if (uint8[i] === 0x44 && uint8[i + 1] === 0x89) {
        durationPos = i;
        break;
      }
    }

    if (durationPos !== -1) {
      const lenByte = uint8[durationPos + 2];
      const dataLen = lenByte & 0x7f;
      if (dataLen === 4) {
        // 4-byte Float (Float32)
        dataView.setFloat32(durationPos + 3, durationMs, false);
        return new Blob([arrayBuffer], { type: blob.type || 'video/webm' });
      } else if (dataLen === 8) {
        // 8-byte Float (Float64)
        dataView.setFloat64(durationPos + 3, durationMs, false);
        return new Blob([arrayBuffer], { type: blob.type || 'video/webm' });
      }
    }

    return blob;
  } catch (err) {
    console.warn("Could not patch WebM duration header:", err);
    return blob;
  }
}
