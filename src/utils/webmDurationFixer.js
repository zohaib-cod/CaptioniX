import fixDurationLib from 'fix-webm-duration';

/**
 * Sanitizes WebM files produced by MediaRecorder:
 * 1. Resets erroneous AlphaMode (0x53 0xC0) inserted by Chromium for canvas streams,
 *    preventing GStreamer / Totem crashes ("Cannot handle streams without an initial alpha buffer").
 * 2. Injects accurate duration and timecode metadata into the Matroska Segment Info header
 *    so all video players (Totem, VLC, QuickTime, Windows Media Player) display the true duration
 *    and seek bars without getting stuck at 0:02.
 */
export async function fixWebmDuration(blob, durationMs, disableAlpha = true) {
  try {
    let cleanBlob = blob;

    // Step 1: Disable AlphaMode if requested (for non-transparent exports)
    if (disableAlpha) {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const u8 = new Uint8Array(arrayBuffer);
        let modified = false;

        // Search for AlphaMode tag (0x53 0xC0) in the Track definition (first 32KB)
        for (let i = 0; i < Math.min(u8.length - 4, 32768); i++) {
          if (u8[i] === 0x53 && u8[i + 1] === 0xc0) {
            const len = u8[i + 2] & 0x7f;
            if (len === 1 && u8[i + 3] !== 0) {
              u8[i + 3] = 0; // Turn off AlphaMode
              modified = true;
            }
          }
        }

        if (modified) {
          cleanBlob = new Blob([u8], { type: blob.type || 'video/webm' });
        }
      } catch (alphaErr) {
        console.warn("AlphaMode patch notice:", alphaErr);
      }
    }

    // Step 2: Inject true duration and timecode scale
    if (durationMs && durationMs > 0) {
      try {
        const fixFn = typeof fixDurationLib === 'function' ? fixDurationLib : fixDurationLib?.default;
        if (typeof fixFn === 'function') {
          cleanBlob = await fixFn(cleanBlob, Math.round(durationMs));
        }
      } catch (durErr) {
        console.warn("Duration injection notice:", durErr);
      }
    }

    return cleanBlob;
  } catch (err) {
    console.warn("WebM metadata fixer error:", err);
    return blob;
  }
}
