export async function fetchImgAsBlob(url: string) {
  return await (await fetch(url)).blob();
}

export async function fetchSoundAsArrayBuffer(url: string) {
  return await (await fetch(url)).arrayBuffer();
}

export function assetFactory(
  items: Array<{ name: string; source: string }>,
  type: string[],
) {
  return items.map((item) => ({
    tag: [],
    ...item,
    type,
  }));
}

export function downloadFile(filename: string, fileSrc: string) {
  const a = document.createElement("a");
  a.setAttribute("download", `${filename}.mp4`);
  a.setAttribute("href", fileSrc);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
