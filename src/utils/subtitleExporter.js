// Subtitle formatting, SRT / VTT export and parser utilities

export function formatTimeSRT(seconds) {
  const pad = (num, size = 2) => String(num).padStart(size, '0');
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
}

export function formatTimeVTT(seconds) {
  const pad = (num, size = 2) => String(num).padStart(size, '0');
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
}

export function formatSecondsToDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;
}

export function generateSRT(subtitles) {
  return subtitles
    .map((sub, index) => {
      const start = formatTimeSRT(sub.start);
      const end = formatTimeSRT(sub.end);
      return `${index + 1}\n${start} --> ${end}\n${sub.text.trim()}\n`;
    })
    .join('\n');
}

export function generateVTT(subtitles) {
  const lines = ['WEBVTT\n'];
  subtitles.forEach((sub, index) => {
    const start = formatTimeVTT(sub.start);
    const end = formatTimeVTT(sub.end);
    lines.push(`${index + 1}\n${start} --> ${end}\n${sub.text.trim()}\n`);
  });
  return lines.join('\n');
}

export function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Simple parser for user-uploaded SRT content
export function parseSRT(srtString) {
  const normalized = srtString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.trim().split(/\n\s*\n/);
  const results = [];

  for (let i = 0; i < blocks.length; i++) {
    const lines = blocks[i].split('\n');
    if (lines.length >= 2) {
      // Find timecode line
      const timeLine = lines.find(l => l.includes('-->'));
      if (timeLine) {
        const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
        const parseTime = (time) => {
          const [hms, ms] = time.replace(',', '.').split('.');
          const parts = hms.split(':').map(Number);
          return (parts[0] * 3600) + (parts[1] * 60) + parts[2] + (Number(ms || 0) / 1000);
        };
        const start = parseTime(startStr);
        const end = parseTime(endStr);
        const textLines = lines.slice(lines.indexOf(timeLine) + 1).join(' ').trim();

        const words = textLines.split(/\s+/).map((word, wIdx, arr) => {
          const wordDuration = (end - start) / arr.length;
          return {
            word,
            start: start + (wIdx * wordDuration),
            end: start + ((wIdx + 1) * wordDuration)
          };
        });

        results.push({
          id: `sub-custom-${i + 1}`,
          start,
          end,
          text: textLines,
          words
        });
      }
    }
  }

  return results;
}
