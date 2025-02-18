function formatTime(seconds: number): string {
  const ms = Math.floor((seconds % 1) * 1000)
    .toString()
    .padStart(3, "0");
  const s = Math.floor(seconds) % 60;
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")},${ms}`;
}

export function genSRT(subtitles: Subtitle[]): string {
  return subtitles
    .map((s, index) => {
      return `${index + 1}\n${formatTime(s.start)} --> ${formatTime(s.end)}\n${
        s.text
      }\n`;
    })
    .join("\n");
}

export function downloadSRT(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}.srt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
